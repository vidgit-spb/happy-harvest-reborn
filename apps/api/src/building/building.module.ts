import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { Building, Garden, GardenMember, User } from 'db';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building, Garden, GardenMember, User]),
    AuthModule,
    WebsocketModule,
  ],
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}
