'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  notificationService,
  type Notification,
  type NotificationType,
} from '@/lib/services/notification.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Bell,
  BellOff,
  CheckCheck,
  Package,
  ShoppingCart,
  UserPlus,
  Settings,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Circle,
  CheckCircle2,
  Inbox,
  Clock,
  Loader2,
  ChevronRight,
  X,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
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

const FILTER_TABS: { key: 'all' | 'unread' | 'read'; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'Tất cả', icon: Inbox },
  { key: 'unread', label: 'Chưa đọc', icon: Circle },
  { key: 'read', label: 'Đã đọc', icon: CheckCircle2 },
];

type StatusFilter = 'all' | 'unread' | 'read';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string): string {
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

// ─── Notification Detail ──────────────────────────────────────────────────────

function NotificationDetail({
  notification,
  onMarkRead,
  onClose,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const isUnread = !notification.read_at;
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.OTHER;
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Detail header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-background/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className={cn('flex size-10 items-center justify-center rounded-2xl border transition-all duration-300 shadow-sm bg-background', cfg.bg, cfg.border)}>
            <Icon className={cn('h-5 w-5', cfg.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border',
                  cfg.bg,
                  cfg.color,
                  cfg.border
                )}
              >
                {cfg.label}
              </span>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelative(notification.created_at)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground/80 mt-1">
              {new Date(notification.created_at).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isUnread && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkRead(notification.notification_id)}
              className="h-9 px-3 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all font-medium"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đánh dấu đã đọc
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {isUnread && (
            <div className="relative flex items-center gap-2.5 text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Thông báo chưa được đọc</span>
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {notification.title}
            </h1>
            
            <div className="border-b border-border/80 pb-2" />
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <div className="bg-card border border-border/70 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
              <p className="text-sm md:text-base text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {notification.content}
              </p>
            </div>
          </div>

          {/* Metadata details block */}
          <div className="rounded-2xl border border-border/80 bg-card/40 overflow-hidden backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-border">
            <div className="px-5 py-3 bg-muted/40 border-b border-border/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Thông tin chi tiết thông báo</span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">ID: #{notification.notification_id.slice(0, 8)}</span>
            </div>
            <div className="p-5 divide-y divide-border/40 text-xs md:text-sm">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Icon className={cn("h-4 w-4", cfg.color)} />
                  <span>Phân loại</span>
                </div>
                <span className={cn('font-semibold px-2.5 py-0.5 rounded-full text-[11px] border', cfg.bg, cfg.color, cfg.border)}>
                  {cfg.label}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  {isUnread ? <Circle className="h-4 w-4 text-amber-500 fill-amber-500/20" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  <span>Trạng thái</span>
                </div>
                <span className={cn('font-semibold flex items-center gap-1.5 text-xs', isUnread ? 'text-amber-500' : 'text-green-500')}>
                  {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                  {isUnread ? 'Chưa đọc' : 'Đã đọc'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Thời gian tạo</span>
                </div>
                <span className="font-semibold text-foreground text-xs md:text-sm">
                  {new Date(notification.created_at).toLocaleString('vi-VN')}
                </span>
              </div>

              {notification.read_at && (
                <div className="flex items-center justify-between py-3 last:pb-0">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <CheckCheck className="h-4 w-4 text-primary" />
                    <span>Thời gian đọc</span>
                  </div>
                  <span className="font-semibold text-foreground text-xs md:text-sm">
                    {new Date(notification.read_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  isSelected,
  onClick,
}: {
  notification: Notification;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isUnread = !notification.read_at;
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.OTHER;
  const Icon = cfg.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-border last:border-0',
        isSelected
          ? 'bg-primary/8 border-l-2 border-l-primary'
          : isUnread
            ? 'bg-primary/3 hover:bg-primary/5'
            : 'hover:bg-accent/40'
      )}
    >
      {/* Unread indicator */}
      {isUnread && !isSelected && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl mt-0.5 transition-transform group-hover:scale-105',
          cfg.bg
        )}
      >
        <Icon className={cn('h-4 w-4', cfg.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug line-clamp-1',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
            )}
          >
            {notification.title}
          </p>
          <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">
            {formatRelative(notification.created_at)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
          {notification.content}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', cfg.bg, cfg.color)}
          >
            {cfg.label}
          </span>
          {isUnread && <span className="text-[10px] font-medium text-amber-500">● Chưa đọc</span>}
        </div>
      </div>

      <ChevronRight
        className={cn(
          'h-4 w-4 shrink-0 mt-1 transition-opacity',
          isSelected
            ? 'text-primary opacity-100'
            : 'text-muted-foreground opacity-0 group-hover:opacity-60'
        )}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await notificationService.getAll(1, 100);
      setNotifications(res.data.data);
    } catch {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      toast.success('Đã đánh dấu đã đọc');
    } catch {
      toast.error('Không thể cập nhật');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read_at);
    if (unread.length === 0) return;
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
      toast.success(`Đã đọc ${unread.length} thông báo`);
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setMarkingAll(false);
    }
  };

  // ─── Filters ──────────────────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (statusFilter === 'unread' && n.read_at) return false;
    if (statusFilter === 'read' && !n.read_at) return false;
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const selectedNotification = notifications.find((n) => n.notification_id === selectedId);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Left Panel: List ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex flex-col border-r border-border bg-background transition-all',
          selectedNotification ? 'w-[420px] shrink-0' : 'flex-1'
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Thông báo</h1>
                <p className="text-xs text-muted-foreground">
                  {stats.unread > 0 ? (
                    <span className="text-primary font-medium">{stats.unread} chưa đọc</span>
                  ) : (
                    'Không có thông báo chưa đọc'
                  )}{' '}
                  · {stats.total} tổng cộng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => load(true)}
                disabled={refreshing}
                title="Làm mới"
              >
                <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="h-8 gap-1.5 text-xs"
                >
                  {markingAll ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5" />
                  )}
                  Đọc tất cả
                </Button>
              )}
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex gap-2">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.key === 'all' ? stats.total : tab.key === 'unread' ? stats.unread : stats.read;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    statusFilter === tab.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                      statusFilter === tab.key
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background text-foreground'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="pl-9 h-9 text-sm bg-muted/40 border-border focus-visible:ring-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Type filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(TYPE_CONFIG) as Array<NotificationType | 'ALL'>).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const Icon = cfg.icon;
              const count =
                type === 'ALL'
                  ? notifications.length
                  : notifications.filter((n) => n.type === type).length;
              if (type !== 'ALL' && count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all',
                    typeFilter === type
                      ? cn(cfg.bg, cfg.color, cfg.border, 'shadow-sm')
                      : 'border-border text-muted-foreground hover:border-border/80 hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-2.5 w-2.5" />
                  {cfg.label}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl">
                  <div className="size-9 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                    <div className="h-2.5 w-full bg-muted/60 animate-pulse rounded" />
                    <div className="h-2 w-1/3 bg-muted/40 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <div className="p-4 bg-muted/50 rounded-2xl">
                <BellOff className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Không có thông báo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search
                    ? `Không tìm thấy kết quả cho "${search}"`
                    : 'Bộ lọc hiện tại không có kết quả'}
                </p>
              </div>
              {(search || statusFilter !== 'all' || typeFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setTypeFilter('ALL');
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Filter className="h-3 w-3" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationRow
                key={n.notification_id}
                notification={n}
                isSelected={selectedId === n.notification_id}
                onClick={() => {
                  setSelectedId((prev) => (prev === n.notification_id ? null : n.notification_id));
                  if (!n.read_at) handleMarkRead(n.notification_id);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right Panel: Detail ──────────────────────────────────────────── */}
      {selectedNotification ? (
        <div className="flex-1 min-w-0 overflow-hidden bg-background">
          <NotificationDetail
            notification={selectedNotification}
            onMarkRead={handleMarkRead}
            onClose={() => setSelectedId(null)}
          />
        </div>
      ) : (
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center gap-4 bg-muted/20 border-l border-border">
          <div className="p-5 bg-muted/50 rounded-2xl">
            <Bell className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/70">Chọn một thông báo</p>
            <p className="text-xs text-muted-foreground mt-1">để xem nội dung chi tiết</p>
          </div>
        </div>
      )}
    </div>
  );
}
