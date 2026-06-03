import api from '@/lib/axios';
import type {
  ISystemSetting,
  ISystemSettingGroup,
  IUpdateSettingPayload,
  ICreateSettingPayload,
} from '@/lib/types/settings';

export const settingsService = {
  getAll() {
    return api.get<ISystemSettingGroup[]>('/settings');
  },

  getByKey(key: string) {
    return api.get<ISystemSetting>(`/settings/${key}`);
  },

  update(key: string, data: IUpdateSettingPayload) {
    return api.put<ISystemSetting>(`/settings/${key}`, data);
  },

  create(data: ICreateSettingPayload) {
    return api.post<ISystemSetting>('/settings', data);
  },

  delete(key: string) {
    return api.delete<void>(`/settings/${key}`);
  },
};
