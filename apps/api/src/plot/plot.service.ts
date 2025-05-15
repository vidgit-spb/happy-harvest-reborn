import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot, Garden, GardenMember, User, PlotStage } from 'db';
import { WebsocketService } from '../websocket/websocket.service';
import { calculateGrowthStage, applyWatering, calculateTheft, canAttemptTheft } from 'game-logic';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PlotService {
  private readonly logger = new Logger(PlotService.name);
  private crops: any;

  constructor(
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
    @InjectRepository(Garden)
    private readonly gardenRepository: Repository<Garden>,
    @InjectRepository(GardenMember)
    private readonly gardenMemberRepository: Repository<GardenMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly websocketService: WebsocketService,
  ) {
    // Load crop data
    this.loadCropData();
  }

  // Load crop data from crops.json
  private loadCropData() {
    try {
      const cropsPath = path.resolve(process.cwd(), '../..', 'content', 'crops.json');
      const cropsData = fs.readFileSync(cropsPath, 'utf8');
      this.crops = JSON.parse(cropsData).crops;
      this.logger.log(`Loaded ${this.crops.length} crops from crops.json`);
    } catch (error) {
      this.logger.error(`Failed to load crops data: ${error.message}`);
      this.crops = []; // Default to empty if file not found
    }
  }

  // Plant a crop on a plot
  async plant(userId: string, { gardenId, x, y, plantId }: { gardenId: string; x: number; y: number; plantId: string }) {
    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Find the plot
    const plot = await this.plotRepository.findOne({
      where: { gardenId, x, y },
    });

    if (!plot) {
      throw new NotFoundException('Plot not found');
    }

    // Check if plot is empty
    if (plot.stage !== PlotStage.EMPTY) {
      throw new BadRequestException('Plot is not empty');
    }

    // Check if crop exists
    const crop = this.crops.find((c) => c.id === plantId);
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    // Get the user to check their coins
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has enough coins
    if (user.coins < crop.seedCost) {
      throw new BadRequestException('Not enough coins');
    }

    // Update user coins
    user.coins -= crop.seedCost;
    await this.userRepository.save(user);

    // Update plot with new plant
    const now = new Date();
    plot.plantId = plantId;
    plot.stage = PlotStage.SEED;
    plot.plantedAt = now;
    plot.lastWateredAt = now;

    await this.plotRepository.save(plot);

    // Notify clients about the plot update
    this.websocketService.sendPlotUpdate(gardenId, plot.id, {
      stage: plot.stage,
      plantedAt: plot.plantedAt,
      lastWateredAt: plot.lastWateredAt,
    });

    // Calculate growth info for the response
    const growthInfo = this.calculatePlotGrowthInfo(plot);

    return {
      plot,
      timeLeft: growthInfo.timeLeft,
      allowedActions: this.getAllowedActions(plot),
    };
  }

  // Water a plot
  async water(userId: string, { plotId }: { plotId: string }) {
    // Find the plot
    const plot = await this.plotRepository.findOne({
      where: { id: plotId },
      relations: ['garden'],
    });

    if (!plot) {
      throw new NotFoundException('Plot not found');
    }

    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId: plot.gardenId },
    });

    const isOwner = plot.garden.ownerId === userId;
    const isMember = membership !== null;

    if (!isOwner && !isMember) {
      throw new BadRequestException('You are not a member of this garden');
    }

    // Check if plot has a plant
    if (plot.stage === PlotStage.EMPTY || !plot.plantId) {
      throw new BadRequestException('Plot is empty');
    }

    // Check if plot is already harvested
    if (plot.stage === PlotStage.HARVEST) {
      throw new BadRequestException('Plant is ready to harvest');
    }

    // Apply watering effect
    const now = new Date();
    plot.lastWateredAt = now;

    // Find crop data
    const crop = this.crops.find((c) => c.id === plot.plantId);
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    // Apply watering boost using game logic
    const wateringResult = applyWatering({
      plantId: plot.plantId,
      plantedAt: plot.plantedAt,
      lastWateredAt: plot.lastWateredAt,
      growthTime: crop.growTime,
      multipliers: {}, // No multipliers in this simple example
    });

    // Update plot with new plantedAt (effectively speeds up growth)
    plot.plantedAt = wateringResult.plantedAt;
    await this.plotRepository.save(plot);

    // If it's a neighbor watering, add XP to both users
    if (!isOwner) {
      const owner = await this.userRepository.findOne({ where: { id: plot.garden.ownerId } });
      const helper = await this.userRepository.findOne({ where: { id: userId } });

      if (owner && helper) {
        // Add XP to both users
        owner.xp += 2;
        helper.xp += 5;
        
        await this.userRepository.save([owner, helper]);
      }
    }

    // Notify clients about the plot update
    this.websocketService.sendPlotUpdate(plot.gardenId, plot.id, {
      lastWateredAt: plot.lastWateredAt,
      plantedAt: plot.plantedAt,
    });

    // Calculate growth info for the response
    const growthInfo = this.calculatePlotGrowthInfo(plot);

    return {
      plot,
      timeLeft: growthInfo.timeLeft,
      allowedActions: this.getAllowedActions(plot),
    };
  }

  // Harvest a plot
  async harvest(userId: string, { plotId }: { plotId: string }) {
    // Find the plot
    const plot = await this.plotRepository.findOne({
      where: { id: plotId },
      relations: ['garden'],
    });

    if (!plot) {
      throw new NotFoundException('Plot not found');
    }

    // Check ownership (only owner can harvest)
    if (plot.garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can harvest');
    }

    // Check if plot is ready to harvest
    if (plot.stage !== PlotStage.HARVEST) {
      throw new BadRequestException('Plant is not ready to harvest');
    }

    // Find crop data
    const crop = this.crops.find((c) => c.id === plot.plantId);
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    // Calculate rewards (adjusted for stealing percentage)
    const stolePercent = plot.stolePercent || 0;
    const yieldMultiplier = 1 - (stolePercent / 100);
    const coins = Math.floor(crop.yield * yieldMultiplier);
    const xp = Math.floor(crop.xp * yieldMultiplier);

    // Update user with rewards
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.coins += coins;
    user.xp += xp;
    await this.userRepository.save(user);

    // Reset plot to empty
    plot.stage = PlotStage.EMPTY;
    plot.plantId = null;
    plot.plantedAt = null;
    plot.lastWateredAt = null;
    plot.stolePercent = 0;
    plot.pest = false;
    
    await this.plotRepository.save(plot);

    // Notify clients about the plot update
    this.websocketService.sendPlotUpdate(plot.gardenId, plot.id, {
      stage: plot.stage,
      plantId: plot.plantId,
      plantedAt: plot.plantedAt,
      lastWateredAt: plot.lastWateredAt,
      stolePercent: 0,
      pest: false
    });

    return {
      success: true,
      reward: {
        coins,
        xp
      }
    };
  }

  // Steal from a plot
  async steal(userId: string, { plotId }: { plotId: string }) {
    // Find the plot
    const plot = await this.plotRepository.findOne({
      where: { id: plotId },
      relations: ['garden'],
    });

    if (!plot) {
      throw new NotFoundException('Plot not found');
    }

    // Can't steal from your own garden
    if (plot.garden.ownerId === userId) {
      throw new BadRequestException('Cannot steal from your own garden');
    }

    // Check if thief's last theft attempt was too recent
    // This would require tracking theft attempts in a separate table
    // For now we'll use a simplified approach
    if (!canAttemptTheft(null)) {
      throw new BadRequestException('You need to wait before stealing again');
    }

    // Find crop data
    const crop = this.crops.find((c) => c.id === plot.plantId);
    if (!crop || plot.stage !== PlotStage.MATURE) {
      throw new BadRequestException('Nothing to steal');
    }

    // Get the thief and garden owner
    const thief = await this.userRepository.findOne({ where: { id: userId } });
    const owner = await this.userRepository.findOne({ where: { id: plot.garden.ownerId } });

    if (!thief || !owner) {
      throw new NotFoundException('User not found');
    }

    // Calculate theft results
    const theftResult = calculateTheft({
      plotStage: plot.stage,
      hasDog: plot.garden.hasDog,
      dogFedWithinDay: plot.garden.dogFedAt && 
        (new Date().getTime() - new Date(plot.garden.dogFedAt).getTime() < 24 * 60 * 60 * 1000),
      maxTheftPercent: 35,
      plotValue: crop.yield,
      theftProtectionItems: [] // No additional protection items in this example
    });

    if (!theftResult.success) {
      return {
        success: false,
        stolenValue: 0,
        damage: 0,
        message: theftResult.message
      };
    }

    // Apply the theft
    plot.stolePercent = (plot.stolePercent || 0) + theftResult.stolenPercent;
    await this.plotRepository.save(plot);

    // Award coins to thief
    thief.coins += theftResult.stolenValue;
    thief.xp += 5; // XP for successful theft

    // Apply damage to thief if there's a dog
    if (theftResult.thiefDamage > 0) {
      thief.coins = Math.max(0, thief.coins - theftResult.thiefDamage);
      owner.coins += theftResult.thiefDamage; // Owner gets the money the thief loses
    }

    await this.userRepository.save([thief, owner]);

    // Notify clients about the plot update
    this.websocketService.sendPlotUpdate(plot.gardenId, plot.id, {
      stolePercent: plot.stolePercent
    });

    // Notify the owner about the theft attempt
    this.websocketService.sendTheftAttempt(
      plot.garden.ownerId, 
      plot.id,
      { id: thief.id, name: thief.username || thief.firstName || 'Unknown' },
      theftResult.stolenPercent
    );

    return {
      success: true,
      stolenValue: theftResult.stolenValue,
      damage: theftResult.thiefDamage,
      message: theftResult.message
    };
  }

  // Remove weeds from a plot
  async removeWeed(userId: string, { plotId }: { plotId: string }) {
    // Find the plot
    const plot = await this.plotRepository.findOne({
      where: { id: plotId },
      relations: ['garden'],
    });

    if (!plot) {
      throw new NotFoundException('Plot not found');
    }

    // Check if there's a weed to remove
    // In a real implementation, we'd have a separate flag for weeds
    // Here we'll reuse the pest flag as an example
    if (!plot.pest) {
      throw new BadRequestException('No weeds to remove');
    }

    // Remove the weed
    plot.pest = false;
    await this.plotRepository.save(plot);

    // Give XP to the user who removed the weed
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.xp += 3;
      await this.userRepository.save(user);
    }

    // Notify clients about the plot update
    this.websocketService.sendPlotUpdate(plot.gardenId, plot.id, {
      pest: false
    });

    // Calculate growth info for the response
    const growthInfo = this.calculatePlotGrowthInfo(plot);

    return {
      plot,
      timeLeft: growthInfo.timeLeft,
      allowedActions: this.getAllowedActions(plot),
    };
  }

  // Helper method to calculate growth info
  private calculatePlotGrowthInfo(plot: Plot) {
    if (plot.stage === PlotStage.EMPTY || !plot.plantId || !plot.plantedAt) {
      return { timeLeft: null };
    }

    const crop = this.crops.find((c) => c.id === plot.plantId);
    if (!crop) {
      return { timeLeft: null };
    }

    const now = new Date();
    const plantedAt = new Date(plot.plantedAt);
    const elapsedMs = now.getTime() - plantedAt.getTime();
    const elapsedSecs = elapsedMs / 1000;
    const remainingSecs = Math.max(0, crop.growTime - elapsedSecs);

    // Format time left
    let timeLeft = '';
    if (remainingSecs <= 0) {
      timeLeft = 'Ready!';
    } else {
      const hours = Math.floor(remainingSecs / 3600);
      const minutes = Math.floor((remainingSecs % 3600) / 60);
      timeLeft = `${hours}h ${minutes}m`;
    }

    return { timeLeft };
  }

  // Helper method to determine allowed actions
  private getAllowedActions(plot: Plot): string[] {
    const actions = [];

    if (plot.stage === PlotStage.EMPTY) {
      actions.push('plant');
    } else {
      if (plot.stage !== PlotStage.HARVEST) {
        actions.push('water');
      }

      if (plot.stage === PlotStage.HARVEST) {
        actions.push('harvest');
      }

      if (plot.pest) {
        actions.push('removeWeed');
      }
    }

    return actions;
  }
}
