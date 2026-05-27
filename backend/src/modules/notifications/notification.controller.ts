import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, JwtPayload, Roles } from 'src/middlewares/auth.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './DTO/create-notification.dto';
import { GetNotificationsDto } from './DTO/get-notifications.dto';
import { INotification, IPaginatedNotifications } from './interfaces/notification.interface';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(
    @CurrentUser() user: any,
    @Query(new ValidationPipe({ transform: true })) query: GetNotificationsDto,
  ): Promise<IPaginatedNotifications> {
    return this.notificationService.getNotificationsForUser(user.sub, query);
  }

  @Patch('/:id/read')
  markAsRead(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<INotification> {
    return this.notificationService.markAsRead(id, user.sub);
  }

  @Post('/read-all')
  async markAllAsRead(@CurrentUser() user: any): Promise<{ success: boolean }> {
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
