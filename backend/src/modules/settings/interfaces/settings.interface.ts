export interface ISystemSetting {
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: string;
  created_at: Date;
  updated_at: Date;
}

export interface ISystemSettingGroup {
  group: string;
  settings: ISystemSetting[];
}
