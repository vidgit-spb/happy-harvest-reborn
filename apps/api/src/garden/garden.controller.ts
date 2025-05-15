import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { GardenService } from './garden.service';
import { AuthService } from '../auth/auth.service';

@Controller('garden')
export class GardenController {
  private readonly logger = new Logger(GardenController.name);

  constructor(
    private readonly gardenService: GardenService,
    private readonly authService: AuthService,
  ) {}

  @Post('create')
  async createGarden(
    @Headers('x-telegram-app-id') initData: string,
    @Body() createGardenDto: { name: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.gardenService.createGarden(user.id, createGardenDto);
  }

  @Post('join')
  async joinGarden(
    @Headers('x-telegram-app-id') initData: string,
    @Body() joinGardenDto: { inviteLink: string },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.gardenService.joinGarden(user.id, joinGardenDto);
  }

  @Get(':id')
  async getGardenById(
    @Headers('x-telegram-app-id') initData: string,
    @Param('id') gardenId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.gardenService.getGardenById(user.id, gardenId);
  }

  @Post(':id/invite')
  async generateInviteLink(
    @Headers('x-telegram-app-id') initData: string,
    @Param('id') gardenId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.gardenService.generateInviteLink(user.id, gardenId);
  }
}
