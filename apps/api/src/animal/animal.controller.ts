import { Controller, Post, Body, Get, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { AnimalService } from './animal.service';
import { AuthService } from '../auth/auth.service';

@Controller('animal')
export class AnimalController {
  private readonly logger = new Logger(AnimalController.name);

  constructor(
    private readonly animalService: AnimalService,
    private readonly authService: AuthService,
  ) {}

  @Post('purchase')
  async purchaseAnimal(
    @Headers('x-telegram-app-id') initData: string,
    @Body() purchaseDto: { gardenId: string; animalTypeId: string; x: number; y: number },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.animalService.purchaseAnimal(user.id, purchaseDto);
  }

  @Post('feed/:animalId')
  async feedAnimal(
    @Headers('x-telegram-app-id') initData: string,
    @Param('animalId') animalId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.animalService.feedAnimal(user.id, { animalId });
  }

  @Get('garden/:gardenId')
  async getGardenAnimals(
    @Headers('x-telegram-app-id') initData: string,
    @Param('gardenId') gardenId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.animalService.getGardenAnimals(user.id, { gardenId });
  }

  @Post('move')
  async moveAnimal(
    @Headers('x-telegram-app-id') initData: string,
    @Body() moveDto: { animalId: string; x: number; y: number },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.animalService.moveAnimal(user.id, moveDto);
  }

  @Post('sell/:animalId')
  async sellAnimal(
    @Headers('x-telegram-app-id') initData: string,
    @Param('animalId') animalId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.animalService.sellAnimal(user.id, { animalId });
  }
}
