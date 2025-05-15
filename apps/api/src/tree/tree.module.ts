import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreeService } from './tree.service';
import { TreeController } from './tree.controller';
import { Tree, Garden, GardenMember, User } from 'db';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tree, Garden, GardenMember, User]),
    AuthModule,
    WebsocketModule,
  ],
  controllers: [TreeController],
  providers: [TreeService],
  exports: [TreeService],
})
export class TreeModule {}
