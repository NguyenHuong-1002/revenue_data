import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { AccountNotificationEntity } from 'src/entities/account-notification.entity';
import { AccountEntity } from 'src/entities/account.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AccountNotificationService } from './account-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      AccountNotificationEntity,
      AccountEntity,
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, AccountNotificationService],
  exports: [NotificationService, AccountNotificationService],
})
export class NotificationModule {}

