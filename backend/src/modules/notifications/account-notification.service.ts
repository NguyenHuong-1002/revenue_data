import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { AccountNotificationEntity } from 'src/entities/account-notification.entity';
import { GetNotificationsDto } from './DTO/get-notifications.dto';
import {
  IAccountNotificationMapping,
  IAccountNotificationStats,
  IPaginatedAccountNotificationMappings,
} from './interfaces/notification.interface';

@Injectable()
export class AccountNotificationService {
  constructor(
    @InjectRepository(AccountNotificationEntity)
    private readonly accountNotificationRepository: Repository<AccountNotificationEntity>,

    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async assertAccountExists(accountId: string): Promise<void> {
    const accountExists = await this.accountRepository.findOne({
      where: { account_id: accountId },
      select: { account_id: true },
    });

    if (!accountExists) {
      throw new NotFoundException(`Account with ID '${accountId}' not found`);
    }
  }

  async getAllAccountIds(): Promise<string[]> {
    const accounts = await this.accountRepository.find({
      select: { account_id: true },
    });
    return accounts.map((account) => account.account_id);
  }

  async getAccountNotificationMappings(
    accountId: string,
    query: GetNotificationsDto,
  ): Promise<IPaginatedAccountNotificationMappings> {
    await this.assertAccountExists(accountId);

    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [mappings, total] = await this.accountNotificationRepository
      .createQueryBuilder('an')
      .innerJoinAndSelect('an.notification', 'notification')
      .where('an.account_id = :accountId', { accountId })
      .orderBy('notification.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data: IAccountNotificationMapping[] = mappings.map((an) => ({
      account_id: an.account_id,
      notification_id: an.notification_id,
      title: an.notification.title,
      content: an.notification.content,
      type: an.notification.type,
      is_read: an.is_read,
      read_at: an.read_at,
      is_deleted: an.is_deleted,
      deleted_at: an.deleted_at,
      created_at: an.notification.created_at,
      updated_at: an.notification.updated_at,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async unlinkNotificationForAccount(
    accountId: string,
    notificationId: string,
  ): Promise<{ success: boolean }> {
    await this.assertAccountExists(accountId);

    const mapping = await this.accountNotificationRepository.findOne({
      where: { account_id: accountId, notification_id: notificationId },
    });

    if (!mapping) {
      throw new NotFoundException(
        `Không tìm thấy mapping thông báo '${notificationId}' cho tài khoản '${accountId}'.`,
      );
    }

    if (mapping.is_deleted === 0) {
      mapping.is_deleted = 1;
      mapping.deleted_at = new Date();
      await this.accountNotificationRepository.save(mapping);
    }

    return { success: true };
  }

  async getAccountNotificationStats(accountId: string): Promise<IAccountNotificationStats> {
    await this.assertAccountExists(accountId);

    const raw = await this.accountNotificationRepository
      .createQueryBuilder('an')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN an.is_deleted = 0 THEN 1 ELSE 0 END)', 'active_total')
      .addSelect('SUM(CASE WHEN an.is_deleted = 0 AND an.is_read = 0 THEN 1 ELSE 0 END)', 'unread')
      .addSelect('SUM(CASE WHEN an.is_deleted = 0 AND an.is_read = 1 THEN 1 ELSE 0 END)', 'read')
      .addSelect('SUM(CASE WHEN an.is_deleted = 1 THEN 1 ELSE 0 END)', 'deleted')
      .where('an.account_id = :accountId', { accountId })
      .getRawOne<{
        total: string;
        active_total: string;
        unread: string;
        read: string;
        deleted: string;
      }>();

    return {
      account_id: accountId,
      total: Number(raw?.total ?? 0),
      active_total: Number(raw?.active_total ?? 0),
      unread: Number(raw?.unread ?? 0),
      read: Number(raw?.read ?? 0),
      deleted: Number(raw?.deleted ?? 0),
    };
  }

  async markAsRead(notificationId: string, accountId: string): Promise<AccountNotificationEntity> {
    const an = await this.accountNotificationRepository.findOne({
      where: { notification_id: notificationId, account_id: accountId },
      relations: { notification: true },
    });

    if (!an) {
      throw new NotFoundException(
        `Không tìm thấy thông báo có ID '${notificationId}' cho tài khoản của bạn.`,
      );
    }

    an.is_read = 1;
    an.read_at = new Date();
    await this.accountNotificationRepository.save(an);

    const saved = await this.accountNotificationRepository.findOne({
      where: { notification_id: notificationId, account_id: accountId },
      relations: { notification: true },
    });

    if (!saved) {
      throw new NotFoundException(`Không thể cập nhật thông báo có ID '${notificationId}'.`);
    }

    return saved;
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
