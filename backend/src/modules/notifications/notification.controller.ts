import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, type JwtPayload, Roles } from 'src/middlewares/auth.guard';
import { NotificationService } from './notification.service';
import { AccountNotificationService } from './account-notification.service';
import { CreateNotificationDto } from './DTO/create-notification.dto';
import { GetNotificationsDto } from './DTO/get-notifications.dto';
import {
  IAccountNotificationStats,
  INotification,
  IPaginatedAccountNotificationMappings,
  IPaginatedNotifications,
} from './interfaces/notification.interface';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly accountNotificationService: AccountNotificationService,
  ) {}

  @Get()
  getNotifications(
    @CurrentUser() user: JwtPayload,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ): Promise<IPaginatedNotifications> {
    return this.notificationService.getNotificationsForUser(user.sub, query);
  }

  @Roles('ADMIN')
  @Get('/accounts/:accountId/mappings')
  getAccountNotificationMappings(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ): Promise<IPaginatedAccountNotificationMappings> {
    return this.accountNotificationService.getAccountNotificationMappings(accountId, query);
  }

  @Roles('ADMIN')
  @Delete('/accounts/:accountId/notifications/:notificationId/unlink')
  @HttpCode(HttpStatus.OK)
  unlinkNotificationForAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ): Promise<{ success: boolean }> {
    return this.accountNotificationService.unlinkNotificationForAccount(accountId, notificationId);
  }

  @Roles('ADMIN')
  @Get('/accounts/:accountId/stats')
  getAccountNotificationStats(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<IAccountNotificationStats> {
    return this.accountNotificationService.getAccountNotificationStats(accountId);
  }

  @Patch('/:id/read')
  markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<INotification> {
    return this.notificationService.markAsRead(id, user.sub);
  }

  @Post('/read-all')
  async markAllAsRead(@CurrentUser() user: JwtPayload): Promise<{ success: boolean }> {
    await this.notificationService.markAllAsRead(user.sub);
    return { success: true };
  }

  @Roles('ADMIN')
  @Post()
  createNotification(
    @Body(new ValidationPipe({ transform: true })) dto: CreateNotificationDto,
  ): Promise<INotification> {
    return this.notificationService.createNotification(dto);
  }
}
