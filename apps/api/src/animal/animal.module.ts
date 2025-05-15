import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { Animal, Garden, GardenMember, User } from 'db';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Animal, Garden, GardenMember, User]),
    AuthModule,
    WebsocketModule,
  ],
  controllers: [AnimalController],
  providers: [AnimalService],
  exports: [AnimalService],
})
export class AnimalModule {}
