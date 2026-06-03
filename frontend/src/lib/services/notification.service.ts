import api from '@/lib/axios';

export type NotificationType = 'SYSTEM' | 'INVENTORY_ALERT' | 'NEW_SALE' | 'CUSTOMER_NEW' | 'OTHER';

export interface Notification {
  notification_id: string;
  account_id: string | null;
  title: string;
  content: string;
  type: NotificationType;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const notificationService = {
  getAll: (page = 1, limit = 20) =>
    api.get<PaginatedNotifications>('/notifications', { params: { page, limit } }),

  markAsRead: (id: string) => api.patch<Notification>(`/notifications/${id}/read`),

  markAllAsRead: () => api.post<{ success: boolean }>('/notifications/read-all'),
};
