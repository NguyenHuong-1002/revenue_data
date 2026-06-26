import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { AccountNotificationEntity } from './entities/account-notification.entity';
import { AccountEntity } from '../accounts/entities/account.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AccountNotificationService } from './account-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, AccountNotificationEntity, AccountEntity]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, AccountNotificationService],
  exports: [NotificationService, AccountNotificationService],
})
export class NotificationModule {}
