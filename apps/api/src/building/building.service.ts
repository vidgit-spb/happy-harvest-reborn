import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building, Garden, GardenMember, User } from 'db';
import { WebsocketService } from '../websocket/websocket.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BuildingService {
  private readonly logger = new Logger(BuildingService.name);
  private buildingTypes: any;

  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Garden)
    private readonly gardenRepository: Repository<Garden>,
    @InjectRepository(GardenMember)
    private readonly gardenMemberRepository: Repository<GardenMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly websocketService: WebsocketService,
  ) {
    // Load building types
    this.loadBuildingTypes();
  }

  // Load building data from shop_items.json
  private loadBuildingTypes() {
    try {
      const shopItemsPath = path.resolve(process.cwd(), '../..', 'content', 'shop_items.json');
      const shopData = fs.readFileSync(shopItemsPath, 'utf8');
      const shopItems = JSON.parse(shopData).items;
      this.buildingTypes = shopItems.filter(item => item.type === 'building');
      this.logger.log(`Loaded ${this.buildingTypes.length} building types from shop_items.json`);
    } catch (error) {
      this.logger.error(`Failed to load building data: ${error.message}`);
      this.buildingTypes = []; // Default to empty if file not found
    }
  }

  // Build a new building in a garden
  async buildBuilding(userId: string, { gardenId, buildingTypeId, x, y }: { gardenId: string; buildingTypeId: string; x: number; y: number }) {
    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId },
    });

    const garden = await this.gardenRepository.findOne({
      where: { id: gardenId },
    });

    if (!garden || !membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Only owner can place buildings
    if (garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can build structures');
    }

    // Check if building type exists
    const buildingType = this.buildingTypes.find((b) => b.id === buildingTypeId);
    if (!buildingType) {
      throw new NotFoundException('Building type not found');
    }

    // Get the user to check their coins
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has enough coins
    if (user.coins < buildingType.cost) {
      throw new BadRequestException('Not enough coins');
    }

    // Check if position is already occupied
    const existingBuilding = await this.buildingRepository.findOne({
      where: { gardenId, x, y },
    });

    if (existingBuilding) {
      throw new BadRequestException('Position is already occupied');
    }

    // Create new building
    const building = new Building();
    building.gardenId = gardenId;
    building.buildingTypeId = buildingTypeId;
    building.x = x;
    building.y = y;
    building.builtAt = new Date();
    building.productionStatus = 'idle';
    building.lastCollectedAt = new Date(); // Start with last collected time to prevent immediate collection
    
    // Special handling for specific building types
    if (buildingType.specialType) {
      switch (buildingType.specialType) {
        case 'factory':
          building.factoryType = buildingType.factoryType || 'standard';
          break;
        case 'storage':
          // Update garden storage capacity
          garden.storageCapacity += buildingType.storageBonus || 0;
          await this.gardenRepository.save(garden);
          break;
        // Other special types can be added here
      }
    }
    
    await this.buildingRepository.save(building);

    // Deduct coins from user
    user.coins -= buildingType.cost;
    user.xp += 20; // Bonus XP for building a structure
    await this.userRepository.save(user);

    // Notify clients about the new building
    this.websocketService.sendGardenUpdate(gardenId, {
      buildings: [this.formatBuilding(building, buildingType)],
    });

    return {
      success: true,
      building: this.formatBuilding(building, buildingType),
    };
  }

  // Start production in a factory building
  async startProduction(userId: string, { buildingId, recipeId }: { buildingId: string; recipeId: string }) {
    // Find the building
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
      relations: ['garden'],
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId: building.gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Get building type
    const buildingType = this.buildingTypes.find((b) => b.id === building.buildingTypeId);
    if (!buildingType) {
      throw new NotFoundException('Building type not found');
    }

    // Check if it's a factory
    if (!buildingType.specialType || buildingType.specialType !== 'factory') {
      throw new BadRequestException('This building cannot produce items');
    }

    // Check if production is already running
    if (building.productionStatus === 'producing') {
      throw new BadRequestException('Production is already in progress');
    }

    // Find recipe in building's available recipes
    const recipe = buildingType.recipes?.find((r) => r.id === recipeId);
    if (!recipe) {
      throw new NotFoundException('Recipe not found for this building');
    }

    // Check if user has the required ingredients
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Simple resource check (in a real app, you would have a proper inventory system)
    if (recipe.ingredients?.includes('coin') && user.coins < recipe.ingredientAmount) {
      throw new BadRequestException('Not enough coins for production');
    }

    // Deduct resources
    if (recipe.ingredients?.includes('coin')) {
      user.coins -= recipe.ingredientAmount;
      await this.userRepository.save(user);
    }

    // Start production
    const now = new Date();
    building.productionStatus = 'producing';
    building.currentRecipeId = recipeId;
    building.productionStartedAt = now;
    building.productionEndsAt = new Date(now.getTime() + recipe.productionTime * 1000); // Convert seconds to milliseconds
    
    await this.buildingRepository.save(building);

    // Notify clients about the building update
    this.websocketService.sendGardenUpdate(building.gardenId, {
      buildings: [this.formatBuilding(building, buildingType)],
    });

    return {
      success: true,
      building: this.formatBuilding(building, buildingType),
    };
  }

  // Collect products from a building
  async collectProducts(userId: string, { buildingId }: { buildingId: string }) {
    // Find the building
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
      relations: ['garden'],
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId: building.gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Get building type
    const buildingType = this.buildingTypes.find((b) => b.id === building.buildingTypeId);
    if (!buildingType) {
      throw new NotFoundException('Building type not found');
    }

    // Check if production is complete
    if (building.productionStatus !== 'producing' || !building.productionEndsAt) {
      throw new BadRequestException('No production to collect');
    }

    const now = new Date();
    if (now < building.productionEndsAt) {
      throw new BadRequestException('Production not yet complete');
    }

    // Find recipe
    const recipe = buildingType.recipes?.find((r) => r.id === building.currentRecipeId);
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    // Reset production status
    building.productionStatus = 'idle';
    building.lastCollectedAt = now;
    building.currentRecipeId = null;
    building.productionStartedAt = null;
    building.productionEndsAt = null;
    
    await this.buildingRepository.save(building);

    // Award products to user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add rewards based on product type
    let rewards = { coins: 0, stars: 0, xp: 0 };
    
    if (recipe.product === 'coin') {
      user.coins += recipe.productAmount;
      rewards.coins = recipe.productAmount;
    } else if (recipe.product === 'star') {
      user.stars += recipe.productAmount;
      rewards.stars = recipe.productAmount;
    }
    
    // Always give XP for collecting
    user.xp += 10;
    rewards.xp = 10;
    
    await this.userRepository.save(user);

    // Notify clients about the building update
    this.websocketService.sendGardenUpdate(building.gardenId, {
      buildings: [this.formatBuilding(building, buildingType)],
    });

    return {
      success: true,
      rewards,
      building: this.formatBuilding(building, buildingType),
    };
  }

  // Get all buildings in a garden
  async getGardenBuildings(userId: string, { gardenId }: { gardenId: string }) {
    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Get all buildings in the garden
    const buildings = await this.buildingRepository.find({
      where: { gardenId },
    });

    // Format and return buildings with their details
    return {
      buildings: buildings.map(building => {
        const buildingType = this.buildingTypes.find((b) => b.id === building.buildingTypeId);
        return this.formatBuilding(building, buildingType);
      }),
    };
  }

  // Demolish a building
  async demolishBuilding(userId: string, { buildingId }: { buildingId: string }) {
    // Find the building
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
      relations: ['garden'],
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    // Only the garden owner can demolish buildings
    if (building.garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can demolish buildings');
    }

    // Get building type details
    const buildingType = this.buildingTypes.find((b) => b.id === building.buildingTypeId);
    if (!buildingType) {
      throw new NotFoundException('Building type not found');
    }

    // Calculate refund value (typically 50% of build cost)
    const refundValue = Math.floor(buildingType.cost * 0.5);

    // Update user's coins
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.coins += refundValue;
    await this.userRepository.save(user);
    
    // Special handling for specific building types before deletion
    if (buildingType.specialType === 'storage') {
      // Update garden storage capacity
      const garden = await this.gardenRepository.findOne({
        where: { id: building.gardenId },
      });
      
      if (garden) {
        garden.storageCapacity = Math.max(0, garden.storageCapacity - (buildingType.storageBonus || 0));
        await this.gardenRepository.save(garden);
      }
    }

    // Delete the building
    await this.buildingRepository.remove(building);

    // Notify clients about the building removal
    this.websocketService.sendGardenUpdate(building.gardenId, {
      removedBuildingIds: [buildingId],
    });

    return {
      success: true,
      refundValue,
    };
  }

  // Helper method to format building data
  private formatBuilding(building: Building, buildingType: any) {
    if (!buildingType) {
      buildingType = { name: 'Unknown', type: 'building' };
    }

    // Calculate production status
    const now = new Date();
    let productionStatus = building.productionStatus;
    let productionTimeLeft = 0;
    let productionPercent = 0;

    if (productionStatus === 'producing' && building.productionStartedAt && building.productionEndsAt) {
      const startTime = new Date(building.productionStartedAt).getTime();
      const endTime = new Date(building.productionEndsAt).getTime();
      const currentTime = now.getTime();
      
      if (currentTime >= endTime) {
        productionStatus = 'ready';
        productionPercent = 100;
      } else {
        productionTimeLeft = Math.ceil((endTime - currentTime) / 1000); // seconds left
        productionPercent = Math.floor(((currentTime - startTime) / (endTime - startTime)) * 100);
      }
    }

    return {
      id: building.id,
      buildingTypeId: building.buildingTypeId,
      name: buildingType.name,
      type: buildingType.type,
      specialType: buildingType.specialType,
      x: building.x,
      y: building.y,
      builtAt: building.builtAt,
      productionStatus,
      currentRecipeId: building.currentRecipeId,
      productionTimeLeft,
      productionPercent,
      lastCollectedAt: building.lastCollectedAt,
      factoryType: building.factoryType,
      // Include available recipes if it's a factory
      recipes: buildingType.specialType === 'factory' ? buildingType.recipes : undefined,
    };
  }
}
