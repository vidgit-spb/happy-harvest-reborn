import { Controller, Get, Post, Body, Headers, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async getMe(@Headers('x-telegram-app-id') initData: string) {
    const user = await this.authService.validateTelegramUser(initData);
    
    if (!user) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return this.authService.getCurrentUser(user.id);
  }

  @Post('validate-telegram')
  async validateTelegramToken(@Body() body: { initData: string }) {
    const result = await this.authService.validateTelegramUser(body.initData);
    
    if (!result) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }
    
    return { success: true, userId: result.id, tgId: result.tgId };
  }
}
