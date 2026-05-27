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
