import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/models/database.module';
import { PlantController } from './plant.controller';
import { PlantService } from './plant.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [PlantController],
  providers: [PlantService],
  exports: [PlantService],
})
export class PlantModule {}
