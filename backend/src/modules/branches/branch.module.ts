import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/models/database.module';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
