import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { NotificationEntity } from 'src/entities/notification.entity';
import { AccountNotificationEntity } from 'src/entities/account-notification.entity';
import { AccountEntity } from 'src/entities/account.entity';
import { CreateNotificationDto } from './DTO/create-notification.dto';
import { GetNotificationsDto } from './DTO/get-notifications.dto';
import { INotification, IPaginatedNotifications } from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,

    @InjectRepository(AccountNotificationEntity)
    private readonly accountNotificationRepository: Repository<AccountNotificationEntity>,

    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<INotification> {
    // 1. Lưu thông báo vào bảng notification
    const notiId = uuidv4();
    const noti = this.notificationRepository.create({
      notification_id: notiId,
      title: dto.title,
      content: dto.content,
      type: dto.type || 'SYSTEM',
    });
    const savedNoti = await this.notificationRepository.save(noti);

    // 2. Liên kết thông báo tới người dùng
    if (dto.account_id) {
      // Gửi cho một tài khoản cụ thể
      const accountExists = await this.accountRepository.findOne({
        where: { account_id: dto.account_id },
      });
      if (accountExists) {
        await this.accountNotificationRepository.save({
          account_id: dto.account_id,
          notification_id: notiId,
          is_read: 0,
          is_deleted: 0,
        });
      }
    } else {
      // Gửi hệ thống (cho tất cả tài khoản active)
      const accounts = await this.accountRepository.find({ select: { account_id: true } });
      if (accounts.length > 0) {
        const records = accounts.map((acc) => ({
          account_id: acc.account_id,
          notification_id: notiId,
          is_read: 0,
          is_deleted: 0,
        }));
        await this.accountNotificationRepository.insert(records);
      }
    }

    return {
      notification_id: savedNoti.notification_id,
      account_id: dto.account_id || null,
      title: savedNoti.title,
      content: savedNoti.content,
      type: savedNoti.type,
      read_at: null,
      created_at: savedNoti.created_at,
      updated_at: savedNoti.updated_at,
    };
  }

  async getNotificationsForUser(
    accountId: string,
    query: GetNotificationsDto,
  ): Promise<IPaginatedNotifications> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [accNotifications, total] = await this.accountNotificationRepository
      .createQueryBuilder('an')
      .innerJoinAndSelect('an.notification', 'notification')
      .where('an.account_id = :accountId', { accountId })
      .andWhere('an.is_deleted = 0')
      .orderBy('notification.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const mappedData: INotification[] = accNotifications.map((an) => ({
      notification_id: an.notification.notification_id,
      account_id: an.account_id,
      title: an.notification.title,
      content: an.notification.content,
      type: an.notification.type,
      read_at: an.read_at,
      created_at: an.notification.created_at,
      updated_at: an.notification.updated_at,
    }));

    return {
      data: mappedData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, accountId: string): Promise<INotification> {
    const an = await this.accountNotificationRepository.findOne({
      where: { notification_id: notificationId, account_id: accountId },
      relations: { notification: true },
    });

    if (!an) {
      throw new NotFoundException(`Không tìm thấy thông báo có ID '${notificationId}' cho tài khoản của bạn.`);
    }

    an.is_read = 1;
    an.read_at = new Date();
    const savedAn = await this.accountNotificationRepository.save(an);

    return {
      notification_id: savedAn.notification.notification_id,
      account_id: savedAn.account_id,
      title: savedAn.notification.title,
      content: savedAn.notification.content,
      type: savedAn.notification.type,
      read_at: savedAn.read_at,
      created_at: savedAn.notification.created_at,
      updated_at: savedAn.notification.updated_at,
    };
  }

  async markAllAsRead(accountId: string): Promise<void> {
    await this.accountNotificationRepository
      .createQueryBuilder()
      .update(AccountNotificationEntity)
      .set({ is_read: 1, read_at: new Date() })
      .where('account_id = :accountId AND is_read = 0', { accountId })
      .execute();
  }
}

