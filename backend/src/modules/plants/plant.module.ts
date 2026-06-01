import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantEntity } from 'src/entities/plant.entity';
import { PlantController } from './plant.controller';
import { PlantService } from './plant.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlantEntity]), NotificationModule],
  controllers: [PlantController],
  providers: [PlantService],
  exports: [PlantService],
})
export class PlantModule {}
