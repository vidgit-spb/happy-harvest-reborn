import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal, Garden, GardenMember, User } from 'db';
import { WebsocketService } from '../websocket/websocket.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AnimalService {
  private readonly logger = new Logger(AnimalService.name);
  private animalTypes: any;

  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
    @InjectRepository(Garden)
    private readonly gardenRepository: Repository<Garden>,
    @InjectRepository(GardenMember)
    private readonly gardenMemberRepository: Repository<GardenMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly websocketService: WebsocketService,
  ) {
    // Load animal types
    this.loadAnimalTypes();
  }

  // Load animal data from animals.json
  private loadAnimalTypes() {
    try {
      const animalsPath = path.resolve(process.cwd(), '../..', 'content', 'animals.json');
      const animalsData = fs.readFileSync(animalsPath, 'utf8');
      this.animalTypes = JSON.parse(animalsData).animals;
      this.logger.log(`Loaded ${this.animalTypes.length} animal types from animals.json`);
    } catch (error) {
      this.logger.error(`Failed to load animal data: ${error.message}`);
      this.animalTypes = []; // Default to empty if file not found
    }
  }

  // Purchase a new animal for a garden
  async purchaseAnimal(userId: string, { gardenId, animalTypeId, x, y }: { gardenId: string; animalTypeId: string; x: number; y: number }) {
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

    // Only owner can place animals
    if (garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can place animals');
    }

    // Check if animal type exists
    const animalType = this.animalTypes.find((a) => a.id === animalTypeId);
    if (!animalType) {
      throw new NotFoundException('Animal type not found');
    }

    // Get the user to check their coins
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has enough coins
    if (user.coins < animalType.cost) {
      throw new BadRequestException('Not enough coins');
    }

    // Check if position is already occupied
    const existingAnimal = await this.animalRepository.findOne({
      where: { gardenId, x, y },
    });

    if (existingAnimal) {
      throw new BadRequestException('Position is already occupied');
    }

    // Create new animal
    const animal = new Animal();
    animal.gardenId = gardenId;
    animal.animalTypeId = animalTypeId;
    animal.x = x;
    animal.y = y;
    animal.purchasedAt = new Date();
    animal.lastFedAt = new Date(); // Start as fed
    
    // For special animals like dog, add protection status
    if (animalTypeId === 'dog') {
      garden.hasDog = true;
      garden.dogFedAt = new Date();
      await this.gardenRepository.save(garden);
    }

    await this.animalRepository.save(animal);

    // Deduct coins from user
    user.coins -= animalType.cost;
    user.xp += 10; // Bonus XP for buying an animal
    await this.userRepository.save(user);

    // Notify clients about the new animal
    this.websocketService.sendGardenUpdate(gardenId, {
      animals: [this.formatAnimal(animal, animalType)],
      hasDog: garden.hasDog,
      dogFedAt: garden.dogFedAt,
    });

    return {
      success: true,
      animal: this.formatAnimal(animal, animalType),
    };
  }

  // Feed an animal
  async feedAnimal(userId: string, { animalId }: { animalId: string }) {
    // Find the animal
    const animal = await this.animalRepository.findOne({
      where: { id: animalId },
      relations: ['garden'],
    });

    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId: animal.gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Check if animal needs feeding (hasn't been fed in the last 24 hours)
    const now = new Date();
    const lastFed = new Date(animal.lastFedAt);
    const hoursSinceLastFed = (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastFed < 24 && animal.animalTypeId !== 'dog') {
      throw new BadRequestException('Animal was fed recently');
    }

    // Update last fed time
    animal.lastFedAt = now;
    
    // If it's a dog, update the garden's dogFedAt
    if (animal.animalTypeId === 'dog') {
      const garden = await this.gardenRepository.findOne({
        where: { id: animal.gardenId },
      });
      
      if (garden) {
        garden.dogFedAt = now;
        await this.gardenRepository.save(garden);
      }
    }
    
    await this.animalRepository.save(animal);

    // Get user and give XP for feeding
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.xp += 3;
      await this.userRepository.save(user);
    }

    // Get rewards for feeding (based on animal type)
    const animalType = this.animalTypes.find((a) => a.id === animal.animalTypeId);
    let rewards = null;
    
    if (animalType && animalType.production) {
      rewards = {
        item: animalType.production.item,
        quantity: animalType.production.quantity,
      };
      
      // Add resources to user
      if (user) {
        switch (animalType.production.item) {
          case 'coin':
            user.coins += animalType.production.quantity;
            break;
          case 'star':
            user.stars += animalType.production.quantity;
            break;
          // Add other resources as necessary
        }
        
        await this.userRepository.save(user);
      }
    }

    // Notify clients about the animal update
    this.websocketService.sendGardenUpdate(animal.gardenId, {
      animals: [this.formatAnimal(animal, animalType)],
    });

    return {
      success: true,
      animal: this.formatAnimal(animal, animalType),
      rewards,
    };
  }

  // Get all animals in a garden
  async getGardenAnimals(userId: string, { gardenId }: { gardenId: string }) {
    // Check membership
    const membership = await this.gardenMemberRepository.findOne({
      where: { userId, gardenId },
    });

    if (!membership) {
      throw new NotFoundException('Garden not found or you are not a member');
    }

    // Get all animals in the garden
    const animals = await this.animalRepository.find({
      where: { gardenId },
    });

    // Format and return animals with their details
    return {
      animals: animals.map(animal => {
        const animalType = this.animalTypes.find((a) => a.id === animal.animalTypeId);
        return this.formatAnimal(animal, animalType);
      }),
    };
  }

  // Move an animal to a new position
  async moveAnimal(userId: string, { animalId, x, y }: { animalId: string; x: number; y: number }) {
    // Find the animal
    const animal = await this.animalRepository.findOne({
      where: { id: animalId },
      relations: ['garden'],
    });

    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    // Only the garden owner can move animals
    if (animal.garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can move animals');
    }

    // Check if the new position is already occupied
    const existingAnimal = await this.animalRepository.findOne({
      where: { 
        gardenId: animal.gardenId, 
        x, 
        y,
        id: { $ne: animalId }  // Exclude the current animal
      },
    });

    if (existingAnimal) {
      throw new BadRequestException('Position is already occupied');
    }

    // Update the animal position
    animal.x = x;
    animal.y = y;
    await this.animalRepository.save(animal);

    // Get animal type details
    const animalType = this.animalTypes.find((a) => a.id === animal.animalTypeId);

    // Notify clients about the animal update
    this.websocketService.sendGardenUpdate(animal.gardenId, {
      animals: [this.formatAnimal(animal, animalType)],
    });

    return {
      success: true,
      animal: this.formatAnimal(animal, animalType),
    };
  }

  // Sell an animal
  async sellAnimal(userId: string, { animalId }: { animalId: string }) {
    // Find the animal
    const animal = await this.animalRepository.findOne({
      where: { id: animalId },
      relations: ['garden'],
    });

    if (!animal) {
      throw new NotFoundException('Animal not found');
    }

    // Only the garden owner can sell animals
    if (animal.garden.ownerId !== userId) {
      throw new BadRequestException('Only the garden owner can sell animals');
    }

    // Get animal type details
    const animalType = this.animalTypes.find((a) => a.id === animal.animalTypeId);
    if (!animalType) {
      throw new NotFoundException('Animal type not found');
    }

    // Calculate sell value (typically half of purchase price)
    const sellValue = Math.floor(animalType.cost * 0.5);

    // Update user's coins
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.coins += sellValue;
    await this.userRepository.save(user);

    // If it's a dog, update the garden
    if (animal.animalTypeId === 'dog') {
      const garden = await this.gardenRepository.findOne({
        where: { id: animal.gardenId },
      });
      
      if (garden) {
        // Check if this was the only dog
        const otherDogs = await this.animalRepository.count({
          where: { 
            gardenId: garden.id,
            animalTypeId: 'dog',
            id: { $ne: animalId } // Not the one we're selling
          }
        });
        
        if (otherDogs === 0) {
          garden.hasDog = false;
          garden.dogFedAt = null;
          await this.gardenRepository.save(garden);
        }
      }
    }

    // Delete the animal
    await this.animalRepository.remove(animal);

    // Notify clients about the animal removal
    this.websocketService.sendGardenUpdate(animal.gardenId, {
      removedAnimalIds: [animalId],
    });

    return {
      success: true,
      sellValue,
    };
  }

  // Helper method to format animal data
  private formatAnimal(animal: Animal, animalType: any) {
    if (!animalType) {
      animalType = { name: 'Unknown', feedHours: 24 };
    }

    // Calculate feeding status
    const now = new Date();
    const lastFed = new Date(animal.lastFedAt);
    const hoursSinceLastFed = (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);
    const feedingTimeLeft = Math.max(0, animalType.feedHours - hoursSinceLastFed);
    const needsFeeding = feedingTimeLeft <= 0;

    return {
      id: animal.id,
      animalTypeId: animal.animalTypeId,
      name: animalType.name,
      x: animal.x,
      y: animal.y,
      purchasedAt: animal.purchasedAt,
      lastFedAt: animal.lastFedAt,
      needsFeeding,
      feedingTimeLeft: needsFeeding ? 0 : feedingTimeLeft,
    };
  }
}
