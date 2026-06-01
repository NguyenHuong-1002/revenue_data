import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreBranchEntity } from 'src/entities/branch.entity';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([StoreBranchEntity]), NotificationModule],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
