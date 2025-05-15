import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck(@Res() res: Response) {
    const status = this.appService.getHealthStatus();
    return res.status(status.isHealthy ? 200 : 500).json(status);
  }
}
