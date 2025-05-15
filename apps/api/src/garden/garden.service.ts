import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Garden, GardenMember, MemberRole, Plot, User } from 'db';
import { WebsocketService } from '../websocket/websocket.service';
import { randomBytes } from 'crypto';

@Injectable()
export class GardenService {
  private readonly logger = new Logger(GardenService.name);

  constructor(
    @InjectRepository(Garden)
    private readonly gardenRepository: Repository<Garden>,
    @InjectRepository(GardenMember)
    private readonly gardenMemberRepository: Repository<GardenMember>,
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly websocketService: WebsocketService,
  ) {}

  // Create a new garden
  async createGarden(userId: string, { name }: { name: string }) {
    // Validate input
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Garden name is required');
    }

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create a new garden
    const garden = this.gardenRepository.create({
      name: name.trim(),
      ownerId: userId,
      width: 6, // Initial size
      height: 15, // Initial size
    });

    // Save the garden
    const savedGarden = await this.gardenRepository.save(garden);

    // Create garden membership for owner
    const membership = this.gardenMemberRepository.create({
      userId,
      gardenId: savedGarden.id,
      role: MemberRole.OWNER,
    });
    await this.gardenMemberRepository.save(membership);

    // Create initial plots
    await this.createInitialPlots(savedGarden);

    this.logger.log(`Garden ${savedGarden.id} created by user ${userId}`);

    // Return garden ID
    return { gardenId: savedGarden.id };
  }

  // Join a garden using invite link
  async joinGarden(userId: string, { inviteLink }: { inviteLink: string }) {
    // Parse the invite link to get garden ID
    let gardenId: string;
    try {
      const decoded = Buffer.from(inviteLink, 'base64').toString('utf-8');
      const [id, _] = decoded.split('|');
      gardenId = id;
    } catch (error) {
      throw new BadRequestException('Invalid invite link');
    }

    // Check if garden exists
    const garden = await this.gardenRepository.findOne({ where: { id: gardenId } });
    if (!garden) {
      throw new NotFoundException('Garden not found');
    }

    // Check if user already a member
    const existingMembership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId },
    });

    if (existingMembership) {
      return { success: true, gardenId };
    }

    // Create new membership
    const membership = this.gardenMemberRepository.create({
      userId,
      gardenId,
      role: MemberRole.MEMBER,
    });
    await this.gardenMemberRepository.save(membership);

    this.logger.log(`User ${userId} joined garden ${gardenId}`);

    return { success: true, gardenId };
  }

  // Get garden by ID with all related entities
  async getGardenById(userId: string, gardenId: string) {
    // Check if user is a member of the garden
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Get the garden with owner
    const garden = await this.gardenRepository.findOne({
      where: { id: gardenId },
      relations: ['owner'],
    });

    if (!garden) {
      throw new NotFoundException('Garden not found');
    }

    // Get all plots in the garden
    const plots = await this.plotRepository.find({ where: { gardenId } });

    // Get trees, animals, buildings (these would come from their respective repositories)
    // For now, we'll return empty arrays
    const trees = [];
    const animals = [];
    const buildings = [];

    // Subscribe the user to garden updates
    this.websocketService.subscribeToGarden(userId, gardenId);

    return {
      garden,
      plots,
      trees,
      animals,
      buildings,
    };
  }

  // Generate an invite link for a garden
  async generateInviteLink(userId: string, gardenId: string) {
    // Check if user is the owner of the garden
    const garden = await this.gardenRepository.findOne({
      where: { id: gardenId, ownerId: userId },
    });

    if (!garden) {
      throw new NotFoundException('Garden not found or you are not the owner');
    }

    // Generate a random token
    const token = randomBytes(16).toString('hex');
    
    // Create the invite payload (gardenId|token)
    const payload = `${gardenId}|${token}`;
    
    // Encode as base64
    const inviteLink = Buffer.from(payload).toString('base64');

    return { inviteLink };
  }

  // Helper method to create initial plots for a new garden
  private async createInitialPlots(garden: Garden) {
    const plots: Plot[] = [];

    // Create a grid of plots based on garden size
    for (let y = 0; y < garden.height; y++) {
      for (let x = 0; x < garden.width; x++) {
        plots.push(
          this.plotRepository.create({
            gardenId: garden.id,
            x,
            y,
          }),
        );
      }
    }

    // Save all plots in a batch
    await this.plotRepository.save(plots);
    this.logger.log(`Created ${plots.length} plots for garden ${garden.id}`);
  }
}
