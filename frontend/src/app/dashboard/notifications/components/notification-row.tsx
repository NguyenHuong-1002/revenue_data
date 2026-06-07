'use client';

import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/services/notification.service';
import { TYPE_CONFIG, formatRelative } from './constants';

interface NotificationRowProps {
  notification: Notification;
  isSelected: boolean;
  onClick: () => void;
}

export function NotificationRow({ notification, isSelected, onClick }: NotificationRowProps) {
  const isUnread = !notification.read_at;
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.OTHER;
  const Icon = cfg.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex gap-4 px-5 py-4.5 cursor-pointer transition-colors border-b border-border/40 last:border-0',
        isSelected
          ? 'bg-muted/75 dark:bg-muted/30'
          : isUnread
            ? 'bg-indigo-500/[0.015] hover:bg-muted/50 dark:hover:bg-muted/20'
            : 'hover:bg-muted/30 dark:hover:bg-muted/15'
      )}
    >
      {/* Icon */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60 dark:bg-muted/40 mt-0.5">
        <Icon className={cn('h-4.5 w-4.5', cfg.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={cn(
              'text-base leading-snug truncate',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
            )}
          >
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground/60 shrink-0">
            {formatRelative(notification.created_at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground/85 leading-relaxed mt-1.5 line-clamp-2">
          {notification.content}
        </p>
        <div className="flex items-center gap-2.5 mt-2.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/50">
            {cfg.label}
          </span>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" title="Chưa đọc" />
          )}
        </div>
      </div>
    </div>
  );
}
