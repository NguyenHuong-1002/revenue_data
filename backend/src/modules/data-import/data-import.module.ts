import { Module } from '@nestjs/common';
import { DataProcessingModule } from '../data-processing/data-processing.module';
import { DataImportController } from './data-import.controller';
import { DataImportService } from './data-import.service';

@Module({
  imports: [DataProcessingModule],
  controllers: [DataImportController],
  providers: [DataImportService],
})
export class DataImportModule {}
