import { Controller, Post, Body, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { PlotService } from './plot.service';
import { AuthService } from '../auth/auth.service';

@Controller('plot')
export class PlotController {
  private readonly logger = new Logger(PlotController.name);

  constructor(
    private readonly plotService: PlotService,
    private readonly authService: AuthService,
  ) {}

  @Post('plant')
  async plant(
    @Headers('x-telegram-app-id') initData: string,
    @Body() plantDto: { gardenId: string; x: number; y: number; plantId: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.plotService.plant(user.id, plantDto);
  }

  @Post('water')
  async water(
    @Headers('x-telegram-app-id') initData: string,
    @Body() waterDto: { plotId: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.plotService.water(user.id, waterDto);
  }

  @Post('harvest')
  async harvest(
    @Headers('x-telegram-app-id') initData: string,
    @Body() harvestDto: { plotId: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.plotService.harvest(user.id, harvestDto);
  }

  @Post('steal')
  async steal(
    @Headers('x-telegram-app-id') initData: string,
    @Body() stealDto: { plotId: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.plotService.steal(user.id, stealDto);
  }

  @Post('remove-weed')
  async removeWeed(
    @Headers('x-telegram-app-id') initData: string,
    @Body() weedDto: { plotId: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.plotService.removeWeed(user.id, weedDto);
  }
}
