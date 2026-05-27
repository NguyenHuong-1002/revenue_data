import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../models/database.module';
import { DataProcessingService } from './data-processing.service';

@Module({
  imports: [DatabaseModule],
  providers: [DataProcessingService],
  exports: [DataProcessingService],
})
export class DataProcessingModule {}
