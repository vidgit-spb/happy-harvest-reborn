import { Controller, Post, Body, Get, Param, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { TreeService } from './tree.service';
import { AuthService } from '../auth/auth.service';

@Controller('tree')
export class TreeController {
  private readonly logger = new Logger(TreeController.name);

  constructor(
    private readonly treeService: TreeService,
    private readonly authService: AuthService,
  ) {}

  @Post('plant')
  async plantTree(
    @Headers('x-telegram-app-id') initData: string,
    @Body() plantDto: { gardenId: string; treeTypeId: string; x: number; y: number },
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.treeService.plantTree(user.id, plantDto);
  }

  @Post('harvest/:treeId')
  async harvestTree(
    @Headers('x-telegram-app-id') initData: string,
    @Param('treeId') treeId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.treeService.harvestTree(user.id, { treeId });
  }

  @Get('garden/:gardenId')
  async getGardenTrees(
    @Headers('x-telegram-app-id') initData: string,
    @Param('gardenId') gardenId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.treeService.getGardenTrees(user.id, { gardenId });
  }

  @Post('remove/:treeId')
  async removeTree(
    @Headers('x-telegram-app-id') initData: string,
    @Param('treeId') treeId: string,
  ) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.treeService.removeTree(user.id, { treeId });
  }
}
