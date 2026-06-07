'use client';

import { Plus, MessageSquare, Trash2, Pin } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { SessionItem } from './session-item';

interface ChatSession {
  id: number;
  title: string;
  description: string | null;
  isPinned: boolean;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: number | null;
  sessionsLoading: boolean;
  onNewSession: () => void;
  onSelectSession: (id: number) => void;
  onDeleteSession: (e: React.MouseEvent, id: number) => void;
  onTogglePin: (e: React.MouseEvent, id: number) => void;
  onStartRename: (e: React.MouseEvent, session: ChatSession) => void;
  onDescEdit: (session: ChatSession) => void;
  onShowDeleteAll: () => void;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  sessionsLoading,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onTogglePin,
  onStartRename,
  onDescEdit,
  onShowDeleteAll,
}: SessionSidebarProps) {
  const pinnedSessions = sessions.filter((s) => s.isPinned);
  const unpinnedSessions = sessions.filter((s) => !s.isPinned);

  return (
    <aside
      className="w-68 shrink-0 flex flex-col border-r border-border bg-zinc-50/50 dark:bg-zinc-950/20 backdrop-blur-md transition-colors duration-300"
      style={{ width: '272px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/60 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="size-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-bold text-foreground/80 tracking-wide uppercase">
              Hội thoại
            </span>
          </div>
          {sessions.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {sessions.length}
            </span>
          )}
        </div>
        <Button
          onClick={onNewSession}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-xl h-10 text-xs border-0"
        >
          <Plus className="size-4 stroke-[2.5]" />
          Cuộc hội thoại mới
        </Button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sessionsLoading ? (
          <div className="flex flex-col gap-2.5 p-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-muted/40 animate-pulse border border-border/10"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
            <div className="size-12 rounded-2xl bg-blue-500/5 flex items-center justify-center mb-3 text-blue-500/40">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-xs text-foreground/80 font-semibold">Chưa có cuộc hội thoại</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[180px] mx-auto leading-relaxed">
              Nhấp vào nút bên trên để tạo cuộc hội thoại mới với AI
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {/* Pinned group */}
            {pinnedSessions.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider">
                  <Pin className="h-2.5 w-2.5 fill-amber-500/10" />
                  <span>Đã ghim</span>
                </div>
                <div className="space-y-1">
                  {pinnedSessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={activeSessionId === session.id}
                      onSelect={onSelectSession}
                      onDelete={onDeleteSession}
                      onPin={onTogglePin}
                      onRename={onStartRename}
                      onDescEdit={onDescEdit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unpinned group */}
            {unpinnedSessions.length > 0 && (
              <div className="space-y-1">
                {pinnedSessions.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground/75 uppercase tracking-wider">
                    <span>Hội thoại khác</span>
                  </div>
                )}
                <div className="space-y-1">
                  {unpinnedSessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={activeSessionId === session.id}
                      onSelect={onSelectSession}
                      onDelete={onDeleteSession}
                      onPin={onTogglePin}
                      onRename={onStartRename}
                      onDescEdit={onDescEdit}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 p-3 bg-zinc-500/5 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 px-1 font-semibold">
          <span>Tổng số: {sessions.length}</span>
          <span>Đã ghim: {pinnedSessions.length}</span>
        </div>
        {sessions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowDeleteAll}
            className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/10 gap-1.5 transition-all duration-200 cursor-pointer rounded-lg font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa toàn bộ lịch sử
          </Button>
        )}
      </div>
    </aside>
  );
}
