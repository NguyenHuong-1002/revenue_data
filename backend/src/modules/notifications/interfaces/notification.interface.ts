export interface INotification {
  notification_id: string;
  account_id: string | null;
  title: string;
  content: string;
  type: 'SYSTEM' | 'INVENTORY_ALERT' | 'NEW_SALE' | 'CUSTOMER_NEW' | 'OTHER';
  read_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface IPaginatedNotifications {
  data: INotification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IAccountNotificationMapping {
  account_id: string;
  notification_id: string;
  title: string;
  content: string;
  type: 'SYSTEM' | 'INVENTORY_ALERT' | 'NEW_SALE' | 'CUSTOMER_NEW' | 'OTHER';
  is_read: number;
  read_at: Date | null;
  is_deleted: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface IPaginatedAccountNotificationMappings {
  data: IAccountNotificationMapping[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IAccountNotificationStats {
  account_id: string;
  total: number;
  active_total: number;
  unread: number;
  read: number;
  deleted: number;
}
