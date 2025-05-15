import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tree, Garden, GardenMember, User } from 'db';
import { WebsocketService } from '../websocket/websocket.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TreeService {
  private readonly logger = new Logger(TreeService.name);
  private treeTypes: any;

  constructor(
    @InjectRepository(Tree)
    private readonly treeRepository: Repository<Tree>,
    @InjectRepository(Garden)
    private readonly gardenRepository: Repository<Garden>,
    @InjectRepository(GardenMember)
    private readonly gardenMemberRepository: Repository<GardenMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly websocketService: WebsocketService,
  ) {
    // Load tree types
    this.loadTreeTypes();
  }

  // Load tree data from trees.json
  private loadTreeTypes() {
    try {
      const treesPath = path.resolve(process.cwd(), '../..', 'content', 'trees.json');
      const treesData = fs.readFileSync(treesPath, 'utf8');
      this.treeTypes = JSON.parse(treesData).trees;
      this.logger.log(`Loaded ${this.treeTypes.length} tree types from trees.json`);
    } catch (error) {
      this.logger.error(`Failed to load tree data: ${error.message}`);
      this.treeTypes = []; // Default to empty if file not found
    }
  }

  // Plant a new tree in a garden
  async plantTree(userId: string, { gardenId, treeTypeId, x, y }: { gardenId: string; treeTypeId: string; x: number; y: number }) {
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

    // Only owner can place trees
    if (garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can plant trees');
    }

    // Check if tree type exists
    const treeType = this.treeTypes.find((t) => t.id === treeTypeId);
    if (!treeType) {
      throw new NotFoundException('Tree type not found');
    }

    // Get the user to check their coins
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has enough coins
    if (user.coins < treeType.cost) {
      throw new BadRequestException('Not enough coins');
    }

    // Check if position is already occupied
    const existingTree = await this.treeRepository.findOne({
      where: { gardenId, x, y },
    });

    if (existingTree) {
      throw new BadRequestException('Position is already occupied');
    }

    // Create new tree
    const tree = new Tree();
    tree.gardenId = gardenId;
    tree.treeTypeId = treeTypeId;
    tree.x = x;
    tree.y = y;
    tree.plantedAt = new Date();
    tree.lastHarvestedAt = new Date(); // Start with last harvested time to prevent immediate harvest
    
    await this.treeRepository.save(tree);

    // Deduct coins from user
    user.coins -= treeType.cost;
    user.xp += 15; // Bonus XP for planting a tree
    await this.userRepository.save(user);

    // Notify clients about the new tree
    this.websocketService.sendGardenUpdate(gardenId, {
      trees: [this.formatTree(tree, treeType)],
    });

    return {
      success: true,
      tree: this.formatTree(tree, treeType),
    };
  }

  // Harvest fruits from a tree
  async harvestTree(userId: string, { treeId }: { treeId: string }) {
    // Find the tree
    const tree = await this.treeRepository.findOne({
      where: { id: treeId },
      relations: ['garden'],
    });

    if (!tree) {
      throw new NotFoundException('Tree not found');
    }

    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId: tree.gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Get tree type
    const treeType = this.treeTypes.find((t) => t.id === tree.treeTypeId);
    if (!treeType) {
      throw new NotFoundException('Tree type not found');
    }

    // Check if tree has fruits ready
    const now = new Date();
    const lastHarvested = new Date(tree.lastHarvestedAt);
    const hoursSinceLastHarvest = (now.getTime() - lastHarvested.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastHarvest < treeType.harvestTime) {
      throw new BadRequestException('Tree does not have fruits yet');
    }

    // Update last harvested time
    tree.lastHarvestedAt = now;
    await this.treeRepository.save(tree);

    // Calculate rewards
    let coins = treeType.harvest.coins || 0;
    let xp = 5; // Base XP for harvesting

    // If it's not the owner, adjust rewards
    if (tree.garden.ownerId !== userId) {
      coins = Math.floor(coins * 0.5); // Half coins for non-owners
    }

    // Update user with rewards
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.coins += coins;
      user.xp += xp;
      await this.userRepository.save(user);
    }

    // If it's a neighbor harvesting, give some coins to the owner too
    if (tree.garden.ownerId !== userId) {
      const owner = await this.userRepository.findOne({ where: { id: tree.garden.ownerId } });
      if (owner) {
        owner.coins += Math.floor(coins * 0.5); // Owner gets half of what the neighbor got
        owner.xp += 2;
        await this.userRepository.save(owner);
      }
    }

    // Notify clients about the tree update
    this.websocketService.sendGardenUpdate(tree.gardenId, {
      trees: [this.formatTree(tree, treeType)],
    });

    return {
      success: true,
      rewards: { coins, xp },
      tree: this.formatTree(tree, treeType),
    };
  }

  // Get all trees in a garden
  async getGardenTrees(userId: string, { gardenId }: { gardenId: string }) {
    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Get all trees in the garden
    const trees = await this.treeRepository.find({
      where: { gardenId },
    });

    // Format and return trees with their details
    return {
      trees: trees.map(tree => {
        const treeType = this.treeTypes.find((t) => t.id === tree.treeTypeId);
        return this.formatTree(tree, treeType);
      }),
    };
  }

  // Remove a tree
  async removeTree(userId: string, { treeId }: { treeId: string }) {
    // Find the tree
    const tree = await this.treeRepository.findOne({
      where: { id: treeId },
      relations: ['garden'],
    });

    if (!tree) {
      throw new NotFoundException('Tree not found');
    }

    // Only the garden owner can remove trees
    if (tree.garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can remove trees');
    }

    // Get tree type details
    const treeType = this.treeTypes.find((t) => t.id === tree.treeTypeId);
    if (!treeType) {
      throw new NotFoundException('Tree type not found');
    }

    // Calculate refund value (typically quarter of purchase price)
    const refundValue = Math.floor(treeType.cost * 0.25);

    // Update user's coins
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.coins += refundValue;
    await this.userRepository.save(user);

    // Delete the tree
    await this.treeRepository.remove(tree);

    // Notify clients about the tree removal
    this.websocketService.sendGardenUpdate(tree.gardenId, {
      removedTreeIds: [treeId],
    });

    return {
      success: true,
      refundValue,
    };
  }

  // Helper method to format tree data
  private formatTree(tree: Tree, treeType: any) {
    if (!treeType) {
      treeType = { name: 'Unknown', harvestTime: 24 };
    }

    // Calculate harvest status
    const now = new Date();
    const lastHarvested = new Date(tree.lastHarvestedAt);
    const hoursSinceLastHarvest = (now.getTime() - lastHarvested.getTime()) / (1000 * 60 * 60);
    const harvestTimeLeft = Math.max(0, treeType.harvestTime - hoursSinceLastHarvest);
    const readyToHarvest = harvestTimeLeft <= 0;

    return {
      id: tree.id,
      treeTypeId: tree.treeTypeId,
      name: treeType.name,
      x: tree.x,
      y: tree.y,
      plantedAt: tree.plantedAt,
      lastHarvestedAt: tree.lastHarvestedAt,
      readyToHarvest,
      harvestTimeLeft: readyToHarvest ? 0 : harvestTimeLeft,
      harvestReward: treeType.harvest || { coins: 0 },
    };
  }
}
