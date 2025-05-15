import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrpcModule } from './trpc/trpc.module';
import { AuthModule } from './auth/auth.module';
import { GardenModule } from './garden/garden.module';
import { PlotModule } from './plot/plot.module';
import { AnimalModule } from './animal/animal.module';
import { TreeModule } from './tree/tree.module';
import { BuildingModule } from './building/building.module';
import { StarModule } from './star/star.module';
import { AdminModule } from './admin/admin.module';
import { WebsocketModule } from './websocket/websocket.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    // Core modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'postgres'),
        port: parseInt(configService.get('DB_PORT', '5432'), 10),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'happy_harvest'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    ScheduleModule.forRoot(),
    
    // Feature modules
    TrpcModule,
    AuthModule,
    GardenModule,
    PlotModule,
    AnimalModule,
    TreeModule,
    BuildingModule,
    StarModule,
    AdminModule,
    WebsocketModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
