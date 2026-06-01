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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly accountNotificationService: AccountNotificationService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy thông báo của tài khoản đang đăng nhập',
    description: 'Trả về danh sách notification đã gắn cho tài khoản hiện tại và chưa bị soft delete.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thông báo thành công.',
    schema: {
      example: {
        data: [
          {
            notification_id: 'noti-001',
            account_id: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
            title: 'Cảnh báo tồn kho',
            content: 'Sản phẩm SANTD-01 sắp hết hàng.',
            type: 'INVENTORY_ALERT',
            read_at: null,
            created_at: '2026-06-01T00:00:00.000Z',
            updated_at: '2026-06-01T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    },
  })
  getNotifications(
    @CurrentUser() user: JwtPayload,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ): Promise<IPaginatedNotifications> {
    return this.notificationService.getNotificationsForUser(user.sub, query);
  }

  @Roles('ADMIN')
  @Get('/accounts/:accountId/mappings')
  @ApiOperation({
    summary: 'Lấy danh sách mapping notification theo account',
    description: 'Dùng để kiểm tra toàn bộ quan hệ account_notification, gồm trạng thái đọc và xoá mềm.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'ID của tài khoản cần xem mapping',
    example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Lấy mapping thành công.',
    schema: {
      example: {
        data: [
          {
            account_id: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
            notification_id: 'noti-001',
            title: 'Cảnh báo tồn kho',
            content: 'Sản phẩm SANTD-01 sắp hết hàng.',
            type: 'INVENTORY_ALERT',
            is_read: 0,
            read_at: null,
            is_deleted: 0,
            deleted_at: null,
            created_at: '2026-06-01T00:00:00.000Z',
            updated_at: '2026-06-01T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    },
  })
  getAccountNotificationMappings(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ): Promise<IPaginatedAccountNotificationMappings> {
    return this.accountNotificationService.getAccountNotificationMappings(accountId, query);
  }

  @Roles('ADMIN')
  @Delete('/accounts/:accountId/notifications/:notificationId/unlink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft delete một notification khỏi account',
    description: 'Chỉ soft delete mapping trong bảng account_notification, không xóa notification gốc.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'ID của tài khoản cần unlink',
    example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'ID của notification cần unlink',
    example: 'noti-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Unlink thành công.',
    schema: { example: { success: true } },
  })
  unlinkNotificationForAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ): Promise<{ success: boolean }> {
    return this.accountNotificationService.unlinkNotificationForAccount(accountId, notificationId);
  }

  @Roles('ADMIN')
  @Get('/accounts/:accountId/stats')
  @ApiOperation({
    summary: 'Thống kê trạng thái read/unread theo account',
    description: 'Trả về tổng số mapping, số active, số đã đọc, chưa đọc và số đã bị soft delete.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'ID của tài khoản cần thống kê',
    example: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công.',
    schema: {
      example: {
        account_id: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
        total: 10,
        active_total: 8,
        unread: 5,
        read: 3,
        deleted: 2,
      },
    },
  })
  getAccountNotificationStats(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<IAccountNotificationStats> {
    return this.accountNotificationService.getAccountNotificationStats(accountId);
  }

  @Patch('/:id/read')
  @ApiOperation({
    summary: 'Đánh dấu notification là đã đọc',
    description: 'Áp dụng cho notification của chính tài khoản đang đăng nhập.',
  })
  @ApiParam({ name: 'id', description: 'ID của notification', example: 'noti-001' })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu đã đọc thành công.',
    schema: {
      example: {
        notification_id: 'noti-001',
        account_id: 'ee9fba92-e53b-43ef-8b0b-47aa9a42f6a9',
        title: 'Cảnh báo tồn kho',
        content: 'Sản phẩm SANTD-01 sắp hết hàng.',
        type: 'INVENTORY_ALERT',
        read_at: '2026-06-01T00:00:00.000Z',
        created_at: '2026-06-01T00:00:00.000Z',
        updated_at: '2026-06-01T00:00:00.000Z',
      },
    },
  })
  markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<INotification> {
    return this.notificationService.markAsRead(id, user.sub);
  }

  @Post('/read-all')
  @ApiOperation({
    summary: 'Đánh dấu tất cả notification là đã đọc',
    description: 'Chỉ áp dụng cho tài khoản đang đăng nhập.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu tất cả đã đọc thành công.',
    schema: { example: { success: true } },
  })
  async markAllAsRead(@CurrentUser() user: JwtPayload): Promise<{ success: boolean }> {
    await this.notificationService.markAllAsRead(user.sub);
    return { success: true };
  }

  @Roles('ADMIN')
  @Post()
  @ApiOperation({
    summary: 'Tạo notification mới',
    description: 'Nếu truyền account_id thì gửi riêng cho tài khoản đó, nếu không thì tạo thông báo hệ thống cho tất cả tài khoản.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo notification thành công.',
    schema: {
      example: {
        notification_id: 'noti-001',
        account_id: null,
        title: 'Cảnh báo tồn kho',
        content: 'Sản phẩm SANTD-01 sắp hết hàng.',
        type: 'INVENTORY_ALERT',
        read_at: null,
        created_at: '2026-06-01T00:00:00.000Z',
        updated_at: '2026-06-01T00:00:00.000Z',
      },
    },
  })
  createNotification(
    @Body(new ValidationPipe({ transform: true })) dto: CreateNotificationDto,
  ): Promise<INotification> {
    return this.notificationService.createNotification(dto);
  }
}

