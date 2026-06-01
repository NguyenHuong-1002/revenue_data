import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product.entity';
import { StoreBranchEntity } from 'src/entities/branch.entity';
import { DatabaseModule } from 'src/models/database.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([ProductEntity, StoreBranchEntity])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
