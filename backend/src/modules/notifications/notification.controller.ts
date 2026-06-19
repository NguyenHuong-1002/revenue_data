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
import { CreateNotificationDto } from './dto/create-notification.dto';
import { GetNotificationsDto } from './dto/get-notifications-all.dto';
import {
  IAccountNotificationStats,
  INotification,
  IPaginatedAccountNotificationMappings,
  IPaginatedNotifications,
} from './interfaces/notification.interface';

/**
 * Controller quản lý thông báo
 * Routes: /notifications
 */
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly accountNotificationService: AccountNotificationService,
  ) {}

  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   * GET /notifications?page=1&limit=10
   */
  @Get()
  getNotifications(
    @CurrentUser() user: JwtPayload,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ): Promise<IPaginatedNotifications> {
    return this.notificationService.getNotificationsForUser(user.sub, query);
  }

  /**
   * [ADMIN] Lấy danh sách liên kết thông báo-tài khoản
   * GET /notifications/accounts/:accountId/mappings
   */
  @Roles('ADMIN')
  @Get('/accounts/:accountId/mappings')
  getAccountNotificationMappings(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ): Promise<IPaginatedAccountNotificationMappings> {
    return this.accountNotificationService.getAccountNotificationMappings(accountId, query);
  }

  /**
   * [ADMIN] Hủy liên kết thông báo với tài khoản
   * DELETE /notifications/accounts/:accountId/notifications/:notificationId/unlink
   */
  @Roles('ADMIN')
  @Delete('/accounts/:accountId/notifications/:notificationId/unlink')
  @HttpCode(HttpStatus.OK)
  unlinkAccountNotification(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ): Promise<{ success: boolean }> {
    return this.accountNotificationService.unlinkNotificationForAccount(accountId, notificationId);
  }

  /**
   * [ADMIN] Lấy thống kê thông báo của tài khoản
   * GET /notifications/accounts/:accountId/stats
   */
  @Roles('ADMIN')
  @Get('/accounts/:accountId/stats')
  getAccountNotificationStats(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<IAccountNotificationStats> {
    return this.accountNotificationService.getAccountNotificationStats(accountId);
  }

  /**
   * Đánh dấu thông báo đã đọc
   * PATCH /notifications/:id/read
   */
  @Patch('/:id/read')
  markNotificationAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<INotification> {
    return this.notificationService.markAsRead(id, user.sub);
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   * POST /notifications/read-all
   */
  @Post('/read-all')
  async markAllNotificationsAsRead(@CurrentUser() user: JwtPayload): Promise<{ success: boolean }> {
    await this.notificationService.markAllAsRead(user.sub);
    return { success: true };
  }

  /**
   * [ADMIN] Tạo thông báo mới
   * POST /notifications
   */
  @Roles('ADMIN')
  @Post()
  createNotification(
    @Body(new ValidationPipe({ transform: true })) dto: CreateNotificationDto,
  ): Promise<INotification> {
    return this.notificationService.createNotification(dto);
  }
}
