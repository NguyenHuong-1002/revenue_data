'use client';

import {
  BellIcon,
  InfoIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  UserPlusIcon,
  MoreHorizontalIcon,
  CheckIcon,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/lib/services/notification.service';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface INotification {
  notification_id: string;
  account_id: string | null;
  title: string;
  content: string;
  type: 'SYSTEM' | 'INVENTORY_ALERT' | 'NEW_SALE' | 'CUSTOMER_NEW' | 'OTHER';
  read_at: string | null;
  created_at: string;
}

// Dữ liệu mock sang trọng phục vụ chế độ offline / fallback
const MOCK_NOTIFICATIONS: INotification[] = [
  {
    notification_id: 'mock-1',
    account_id: null,
    title: 'Tạo sản phẩm mới',
    content: 'Admin hoangle đã tạo mới sản phẩm SP17167990 (Màu: Black, Kích cỡ: L).',
    type: 'SYSTEM',
    read_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 phút trước
  },
  {
    notification_id: 'mock-2',
    account_id: null,
    title: 'Cảnh báo tồn kho',
    content: 'Cảnh báo: Tồn kho sản phẩm SP_9812739 tại chi nhánh Hà Nội xuống dưới mức tối thiểu!',
    type: 'INVENTORY_ALERT',
    read_at: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 phút trước
  },
  {
    notification_id: 'mock-3',
    account_id: null,
    title: 'Doanh số mới',
    content:
      'Đơn hàng mới! Khách hàng 098****321 đã mua sản phẩm SP173918 tại chi nhánh Hồ Chí Minh.',
    type: 'NEW_SALE',
    read_at: null,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 giờ trước
  },
  {
    notification_id: 'mock-4',
    account_id: null,
    title: 'Tạo tài khoản mới',
    content:
      'Admin hoangle đã tạo mới tài khoản staff_lananh (Nguyễn Thị Lan Anh) với vai trò STAFF.',
    type: 'CUSTOMER_NEW',
    read_at: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 giờ trước
  },
  {
    notification_id: 'mock-5',
    account_id: null,
    title: 'Cập nhật sản phẩm',
    content: 'Admin hoangle đã cập nhật thông tin sản phẩm SP16239128.',
    type: 'SYSTEM',
    read_at: '2026-05-27T00:00:00.000Z',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = React.useState<INotification[]>(MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);

  // Hàm đồng bộ danh sách từ Backend API
  const fetchNotifications = React.useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;

      const response = await notificationService.getAll(1, 100);
      if (response.data && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);
      }
    } catch (err) {
      console.warn('Backend offline or unreachable, running in rich demo fallback mode.', err);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for dynamic updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Cập nhật số lượng chưa đọc mỗi khi danh sách thay đổi
  React.useEffect(() => {
    const unread = notifications.filter((n) => !n.read_at).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Đánh dấu một thông báo đã đọc
  const handleMarkAsRead = async (id: string) => {
    // Cập nhật UI nhanh chóng
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token || id.startsWith('mock-')) return;

      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read in backend', err);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;

      // Chỉ thực hiện gọi API nếu không phải thông báo mock
      const hasRealNoti = notifications.some((n) => !n.notification_id.startsWith('mock-'));
      if (!hasRealNoti) return;

      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read in backend', err);
    }
  };

  // Định dạng thời gian hiển thị tương đối cực thân thiện
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Lấy Icon và màu sắc phù hợp cho từng loại thông báo
  const getTypeConfig = (type: INotification['type']) => {
    switch (type) {
      case 'SYSTEM':
        return {
          icon: <InfoIcon className="size-4 text-blue-500" />,
          bgColor: 'bg-blue-500/10 border-blue-500/20',
        };
      case 'INVENTORY_ALERT':
        return {
          icon: <AlertTriangleIcon className="size-4 text-rose-500" />,
          bgColor: 'bg-rose-500/10 border-rose-500/20',
        };
      case 'NEW_SALE':
        return {
          icon: <TrendingUpIcon className="size-4 text-emerald-500" />,
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        };
      case 'CUSTOMER_NEW':
        return {
          icon: <UserPlusIcon className="size-4 text-purple-500" />,
          bgColor: 'bg-purple-500/10 border-purple-500/20',
        };
      default:
        return {
          icon: <MoreHorizontalIcon className="size-4 text-muted-foreground" />,
          bgColor: 'bg-muted border-border',
        };
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-muted/80 transition-all duration-200"
          aria-label="Xem thông báo"
        >
          <BellIcon
            className={`size-5 text-foreground/80 ${unreadCount > 0 ? 'animate-pulse' : ''}`}
          />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center bg-rose-500 text-[10px] font-bold text-white rounded-full border border-background shadow-sm shadow-rose-500/30"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 sm:w-[420px] rounded-xl border border-white/10 dark:border-white/5 bg-card/95 backdrop-blur-md shadow-2xl p-2 mr-4 overflow-hidden max-h-[500px] flex flex-col transition-all duration-300"
        align="end"
      >
        <DropdownMenuLabel className="px-3 py-2 flex items-center justify-between font-normal">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Thông báo quan trọng</span>
            {unreadCount > 0 && (
              <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 font-medium px-2 py-0 text-[11px] rounded-full">
                {unreadCount} mới
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg px-2 flex items-center gap-1 font-medium transition-colors"
            >
              <CheckIcon className="size-3" />
              Đọc tất cả
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1" />

        <div className="flex-1 overflow-y-auto pr-1 space-y-1 py-1 max-h-[380px] scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <BellIcon className="size-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Không có thông báo nào</p>
              <p className="text-xs text-muted-foreground/60 px-6 mt-1">
                Các thông tin về thao tác của Admin và cập nhật hệ thống sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            notifications.map((noti) => {
              const config = getTypeConfig(noti.type);
              const isUnread = !noti.read_at;

              return (
                <div
                  key={noti.notification_id}
                  onClick={() => isUnread && handleMarkAsRead(noti.notification_id)}
                  className={`group relative flex items-start gap-3 p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                    isUnread
                      ? 'bg-primary/5 hover:bg-primary/10 border-primary/10'
                      : 'bg-background hover:bg-muted/30 border-transparent hover:border-border'
                  }`}
                >
                  {/* Icon loại thông báo */}
                  <div
                    className={`size-8 shrink-0 flex items-center justify-center rounded-lg border ${config.bgColor}`}
                  >
                    {config.icon}
                  </div>

                  {/* Nội dung thông báo */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-foreground/90 group-hover:text-primary transition-colors">
                        {noti.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(noti.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {noti.content}
                    </p>
                  </div>

                  {/* Chấm tròn báo hiệu chưa đọc */}
                  {isUnread && (
                    <span className="absolute top-3.5 right-3 size-2 rounded-full bg-rose-500 ring-4 ring-rose-500/10 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
