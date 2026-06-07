'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, CheckCheck, X } from 'lucide-react';
import type { Notification } from '@/lib/services/notification.service';
import { TYPE_CONFIG, formatRelative } from './constants';

interface NotificationDetailProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationDetail({ notification, onMarkRead, onClose }: NotificationDetailProps) {
  const isUnread = !notification.read_at;
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.OTHER;
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Detail header */}
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 shrink-0 bg-background/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 dark:bg-muted/40">
            <Icon className={cn('h-4.5 w-4.5', cfg.color)} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Chi tiết thông báo</h3>
            <p className="text-xs text-muted-foreground">
              {formatRelative(notification.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isUnread && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkRead(notification.notification_id)}
              className="h-8.5 px-3 gap-1.5 text-xs border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-950/30 transition-all font-medium rounded-lg"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đánh dấu đã đọc
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8.5 w-8.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              {notification.title}
            </h1>

            {/* Inline metadata row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-muted-foreground font-medium">
              {/* Phân loại - Tối giản */}
              <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
                <span className="font-semibold text-foreground">{cfg.label}</span>
              </div>

              <span className="h-3.5 w-px bg-border/60 shrink-0 hidden sm:inline" />

              {/* Trạng thái - Tối giản */}
              <div className="flex items-center gap-2">
                {isUnread ? (
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
                <span
                  className={cn(
                    'font-semibold',
                    isUnread
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-500'
                  )}
                >
                  {isUnread ? 'Chưa đọc' : 'Đã đọc'}
                </span>
              </div>

              <span className="h-3.5 w-px bg-border/60 shrink-0 hidden sm:inline" />

              {/* Đã tạo */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                <span className="text-foreground/75">
                  {new Date(notification.created_at).toLocaleString('vi-VN')}
                </span>
              </div>

              {!isUnread && notification.read_at && (
                <>
                  <span className="h-3.5 w-px bg-border/60 shrink-0 hidden sm:inline" />
                  {/* Đã đọc */}
                  <div className="flex items-center gap-2">
                    <CheckCheck className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>
                      Đọc lúc{' '}
                      <span className="text-foreground/75">
                        {new Date(notification.read_at).toLocaleString('vi-VN')}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="border-b border-border/40 pt-2" />
          </div>

          {/* Clean Content Area */}
          <div className="prose dark:prose-invert max-w-none pt-2">
            <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap font-normal">
              {notification.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
