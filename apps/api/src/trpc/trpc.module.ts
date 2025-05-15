import { Module } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcController } from './trpc.controller';
import { AuthModule } from '../auth/auth.module';
import { GardenModule } from '../garden/garden.module';
import { PlotModule } from '../plot/plot.module';
import { AnimalModule } from '../animal/animal.module';
import { FactoryModule } from '../factory/factory.module';
import { StarModule } from '../star/star.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    AuthModule,
    GardenModule,
    PlotModule,
    AnimalModule,
    FactoryModule,
    StarModule,
    AdminModule,
  ],
  controllers: [TrpcController],
  providers: [TrpcService],
  exports: [TrpcService],
})
export class TrpcModule {}
