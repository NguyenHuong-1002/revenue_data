'use client';

import { Clock, MessageSquare, Pin, PinOff, FileText, Pencil, Trash2 } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: number;
  title: string;
  description: string | null;
  isPinned: boolean;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onPin: (e: React.MouseEvent, id: number) => void;
  onRename: (e: React.MouseEvent, s: ChatSession) => void;
  onDescEdit: (s: ChatSession) => void;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  onPin,
  onRename,
  onDescEdit,
}: SessionItemProps) {
  const lastTime = session.lastAccessedAt ?? session.updatedAt;

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={cn(
        'group relative rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200 border flex flex-col min-w-0',
        isActive
          ? 'bg-blue-600/5 dark:bg-blue-500/10 border-blue-500/15 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'bg-transparent border-transparent hover:bg-muted/40 text-muted-foreground hover:text-foreground'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
      )}

      {/* ── Normal mode ── */}
      <div className="flex flex-col min-w-0">
        {/* Top row: icon + title + actions */}
        <div className="flex items-center gap-2.5 min-w-0">
          {session.isPinned ? (
            <Pin className="size-3.5 shrink-0 text-amber-500 fill-amber-500/10" />
          ) : (
            <MessageSquare
              className={cn(
                'size-3.5 shrink-0 transition-colors duration-200',
                isActive
                  ? 'text-blue-500'
                  : 'text-muted-foreground/60 group-hover:text-muted-foreground'
              )}
            />
          )}
          <span
            className={cn(
              'flex-1 text-xs font-semibold truncate transition-colors duration-200',
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-foreground/80'
            )}
          >
            {session.title}
          </span>

          {/* Action buttons (visible on hover or active) */}
          <div
            className={cn(
              'flex items-center gap-0.5 shrink-0 transition-all duration-200',
              'opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0',
              isActive && 'opacity-100 translate-x-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => onPin(e, session.id)}
              className={cn(
                'p-1 rounded-md transition-all cursor-pointer duration-150',
                session.isPinned
                  ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
                  : 'text-muted-foreground/75 hover:text-amber-500 hover:bg-amber-500/10'
              )}
              title={session.isPinned ? 'Bỏ ghim' : 'Ghim'}
            >
              {session.isPinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDescEdit(session);
              }}
              className="p-1 rounded-md text-muted-foreground/75 hover:text-blue-600 hover:bg-blue-500/10 transition-all cursor-pointer duration-150"
              title="Thêm mô tả"
            >
              <FileText className="size-3" />
            </button>
            <button
              onClick={(e) => onRename(e, session)}
              className="p-1 rounded-md text-muted-foreground/75 hover:text-blue-600 hover:bg-blue-500/10 transition-all cursor-pointer duration-150"
              title="Đổi tên"
            >
              <Pencil className="size-3" />
            </button>
            <button
              onClick={(e) => onDelete(e, session.id)}
              className="p-1 rounded-md text-muted-foreground/75 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer duration-150"
              title="Xóa"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        </div>

        {/* Description */}
        {session.description && (
          <p className="text-[11px] text-muted-foreground/70 truncate mt-1 ml-6 leading-relaxed font-normal">
            {session.description}
          </p>
        )}

        {/* Last accessed time */}
        <div className="flex items-center gap-1.5 mt-1.5 ml-6">
          <Clock className="size-3 text-muted-foreground/40 shrink-0" />
          <span className="text-[10px] text-muted-foreground/50 truncate font-medium">
            {formatRelativeTime(lastTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
