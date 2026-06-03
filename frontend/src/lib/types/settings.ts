export interface ISystemSetting {
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: string;
  created_at: string;
  updated_at: string;
}

export interface ISystemSettingGroup {
  group: string;
  settings: ISystemSetting[];
}

export interface IUpdateSettingPayload {
  value: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  group?: string;
}

export interface ICreateSettingPayload {
  key: string;
  value: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  group?: string;
  description?: string;
}
