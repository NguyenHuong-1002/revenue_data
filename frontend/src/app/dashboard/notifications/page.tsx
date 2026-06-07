'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  notificationService,
  type Notification,
  type NotificationType,
} from '@/lib/services/notification.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Bell, BellOff, CheckCheck, RefreshCw, Search, Filter, Loader2, X } from 'lucide-react';

import { TYPE_CONFIG, FILTER_TABS, type StatusFilter } from './components/constants';
import { NotificationRow } from './components/notification-row';
import { NotificationDetail } from './components/notification-detail';

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
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border border-border/50 bg-card">
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
    </div>
  );
}
