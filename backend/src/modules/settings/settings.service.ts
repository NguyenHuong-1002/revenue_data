import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettingEntity } from 'src/entities/system-setting.entity';
import { UpdateSettingDto } from './DTO/update-setting.dto';
import { ISystemSetting, ISystemSettingGroup } from './interfaces/settings.interface';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSettingEntity)
    private readonly settingsRepository: Repository<SystemSettingEntity>,
  ) {}

  async getAllGrouped(): Promise<ISystemSettingGroup[]> {
    const settings = await this.settingsRepository.find({ order: { group: 'ASC', key: 'ASC' } });
    const groupedMap = new Map<string, ISystemSetting[]>();
    for (const s of settings) {
      const group = s.group || 'general';
      if (!groupedMap.has(group)) groupedMap.set(group, []);
      groupedMap.get(group)!.push(s as ISystemSetting);
    }
    return Array.from(groupedMap.entries()).map(([group, settings]) => ({ group, settings }));
  }

  async getByKey(key: string): Promise<ISystemSetting> {
    const setting = await this.settingsRepository.findOneBy({ key });
    if (!setting) {
      throw new NotFoundException(`Cài đặt với key '${key}' không tồn tại`);
    }
    return setting as ISystemSetting;
  }

  async update(key: string, dto: UpdateSettingDto): Promise<ISystemSetting> {
    let setting = await this.settingsRepository.findOneBy({ key });
    if (setting) {
      setting.value = dto.value;
      if (dto.description !== undefined) setting.description = dto.description;
      if (dto.type !== undefined) setting.type = dto.type;
      if (dto.group !== undefined) setting.group = dto.group;
    } else {
      setting = this.settingsRepository.create({
        key,
        value: dto.value,
        description: dto.description || '',
        type: dto.type || 'string',
        group: dto.group || 'general',
      });
    }
    await this.settingsRepository.save(setting);
    return setting as ISystemSetting;
  }

  async create(dto: {
    key: string;
    value: string;
    type?: string;
    group?: string;
    description?: string;
  }): Promise<ISystemSetting> {
    const existing = await this.settingsRepository.findOneBy({ key: dto.key });
    if (existing) {
      throw new ConflictException(`Cài đặt với key '${dto.key}' đã tồn tại`);
    }
    const setting = this.settingsRepository.create({
      key: dto.key,
      value: dto.value,
      type: (dto.type as ISystemSetting['type']) || 'string',
      group: dto.group || 'general',
      description: dto.description || '',
    });
    await this.settingsRepository.save(setting);
    return setting as ISystemSetting;
  }

  async delete(key: string): Promise<void> {
    const setting = await this.settingsRepository.findOneBy({ key });
    if (!setting) {
      throw new NotFoundException(`Cài đặt với key '${key}' không tồn tại`);
    }
    await this.settingsRepository.remove(setting);
  }

  async getValue(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await this.settingsRepository.findOneBy({ key });
    return setting ? setting.value : defaultValue;
  }

  async seedDefaults(): Promise<void> {
    const defaults = [
      {
        key: 'SYSTEM_NAME',
        value: 'Hệ thống Quản lý Doanh thu',
        description: 'Tên hệ thống',
        type: 'string' as const,
        group: 'general',
      },
      {
        key: 'SYSTEM_LOGO',
        value: '',
        description: 'URL logo hệ thống',
        type: 'string' as const,
        group: 'general',
      },
      {
        key: 'SYSTEM_DESCRIPTION',
        value: 'Hệ thống quản lý doanh thu, dự báo và phân tích bán hàng',
        description: 'Mô tả ngắn hệ thống',
        type: 'string' as const,
        group: 'general',
      },
      {
        key: 'NOTIFICATION_RETENTION_DAYS',
        value: '90',
        description: 'Số ngày lưu trữ thông báo',
        type: 'number' as const,
        group: 'notification',
      },
      {
        key: 'MAX_LOGIN_ATTEMPTS',
        value: '5',
        description: 'Số lần đăng nhập sai tối đa trước khi khóa',
        type: 'number' as const,
        group: 'security',
      },
      {
        key: 'SESSION_TIMEOUT_MINUTES',
        value: '60',
        description: 'Thời gian hết hạn session (phút)',
        type: 'number' as const,
        group: 'security',
      },
    ];

    for (const def of defaults) {
      const existing = await this.settingsRepository.findOneBy({ key: def.key });
      if (!existing) {
        await this.settingsRepository.save(this.settingsRepository.create(def));
      }
    }
  }
}
