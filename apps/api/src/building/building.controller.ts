import { Controller, Post, Body, Get, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { BuildingService } from './building.service';
import { AuthService } from '../auth/auth.service';

@Controller('building')
export class BuildingController {
  private readonly logger = new Logger(BuildingController.name);

  constructor(
    private readonly buildingService: BuildingService,
    private readonly authService: AuthService,
  ) {}

  @Post('build')
  async buildBuilding(
    @Headers('x-telegram-app-id') initData: string,
    @Body() buildDto: { gardenId: string; buildingTypeId: string; x: number; y: number },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.buildingService.buildBuilding(user.id, buildDto);
  }

  @Post('production/start')
  async startProduction(
    @Headers('x-telegram-app-id') initData: string,
    @Body() productionDto: { buildingId: string; recipeId: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.buildingService.startProduction(user.id, productionDto);
  }

  @Post('production/collect/:buildingId')
  async collectProducts(
    @Headers('x-telegram-app-id') initData: string,
    @Param('buildingId') buildingId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.buildingService.collectProducts(user.id, { buildingId });
  }

  @Get('garden/:gardenId')
  async getGardenBuildings(
    @Headers('x-telegram-app-id') initData: string,
    @Param('gardenId') gardenId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.buildingService.getGardenBuildings(user.id, { gardenId });
  }

  @Post('demolish/:buildingId')
  async demolishBuilding(
    @Headers('x-telegram-app-id') initData: string,
    @Param('buildingId') buildingId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.buildingService.demolishBuilding(user.id, { buildingId });
  }
}
