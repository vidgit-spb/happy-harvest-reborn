import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GardenService } from './garden.service';
import { GardenController } from './garden.controller';
import { Garden, GardenMember, Plot, User } from 'db';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Garden, GardenMember, Plot, User]),
    WebsocketModule,
  ],
  controllers: [GardenController],
  providers: [GardenService],
  exports: [GardenService],
})
export class GardenModule {}
