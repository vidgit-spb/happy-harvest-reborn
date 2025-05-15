import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlotService } from './plot.service';
import { PlotController } from './plot.controller';
import { Plot, Garden, GardenMember, User } from 'db';
import { WebsocketModule } from '../websocket/websocket.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plot, Garden, GardenMember, User]),
    WebsocketModule,
    AuthModule,
  ],
  controllers: [PlotController],
  providers: [PlotService],
  exports: [PlotService],
})
export class PlotModule {}
