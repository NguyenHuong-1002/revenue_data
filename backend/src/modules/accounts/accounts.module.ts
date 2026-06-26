import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './entities/account.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { NotificationModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity]), NotificationModule], // đăng kí entity sử dụng TypeORM
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
