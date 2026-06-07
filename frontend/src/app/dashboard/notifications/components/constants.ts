import * as React from 'react';
import {
  Inbox,
  Settings,
  Package,
  ShoppingCart,
  UserPlus,
  AlertCircle,
  Circle,
  CheckCircle2,
} from 'lucide-react';
import type { NotificationType } from '@/lib/services/notification.service';

export const TYPE_CONFIG: Record<
  NotificationType | 'ALL',
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  ALL: {
    label: 'Tất cả',
    icon: Inbox,
    color: 'text-foreground',
    bg: 'bg-muted/50',
    border: 'border-border',
  },
  SYSTEM: {
    label: 'Hệ thống',
    icon: Settings,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-800',
  },
  INVENTORY_ALERT: {
    label: 'Tồn kho',
    icon: Package,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-800',
  },
  NEW_SALE: {
    label: 'Đơn hàng',
    icon: ShoppingCart,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-200 dark:border-green-800',
  },
  CUSTOMER_NEW: {
    label: 'Khách hàng',
    icon: UserPlus,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-800',
  },
  OTHER: {
    label: 'Khác',
    icon: AlertCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
};

export const FILTER_TABS: {
  key: 'all' | 'unread' | 'read';
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'all', label: 'Tất cả', icon: Inbox },
  { key: 'unread', label: 'Chưa đọc', icon: Circle },
  { key: 'read', label: 'Đã đọc', icon: CheckCircle2 },
];

export type StatusFilter = 'all' | 'unread' | 'read';

export function formatRelative(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
