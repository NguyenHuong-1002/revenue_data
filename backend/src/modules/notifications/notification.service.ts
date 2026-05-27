import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { NotificationEntity } from 'src/entities/notification.entity';
import { CreateNotificationDto } from './DTO/create-notification.dto';
import { GetNotificationsDto } from './DTO/get-notifications.dto';
import { INotification, IPaginatedNotifications } from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<INotification> {
    const noti = this.notificationRepository.create({
      notification_id: uuidv4(),
      account_id: dto.account_id || null,
      title: dto.title,
      content: dto.content,
      type: dto.type || 'SYSTEM',
      read_at: null,
    });
    return this.notificationRepository.save(noti);
  }

  async getNotificationsForUser(
    accountId: string,
    query: GetNotificationsDto,
  ): Promise<IPaginatedNotifications> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.account_id = :accountId OR notification.account_id IS NULL', { accountId })
      .orderBy('notification.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: notifications as INotification[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, accountId: string): Promise<INotification> {
    const noti = await this.notificationRepository.findOneBy({ notification_id: notificationId });
    if (!noti) {
      throw new NotFoundException(`Không tìm thấy thông báo có ID '${notificationId}'`);
    }

    if (noti.account_id && noti.account_id !== accountId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa thông báo này!');
    }

    noti.read_at = new Date();
    return this.notificationRepository.save(noti);
  }

  async markAllAsRead(accountId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ read_at: new Date() })
      .where('(account_id = :accountId OR account_id IS NULL) AND read_at IS NULL', { accountId })
      .execute();
  }
}
