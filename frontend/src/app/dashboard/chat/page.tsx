'use client';

import { Sparkles, Trash2, Pin, Calendar } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { ChatInput } from './components/chat-input';
import { ChatMessages } from './components/chat-messages';
import { DeleteAllModal } from './components/delete-all-modal';
import { DeleteSessionModal } from './components/delete-session-modal';
import { DescriptionEditor } from './components/description-editor';
import { RenameSessionModal } from './components/rename-modal';
import { SessionSidebar } from './components/session-sidebar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatSession {
  id: number;
  title: string;
  description: string | null;
  isPinned: boolean;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// SUGGESTIONS has been extracted to ChatMessages component

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatAssistantPage() {
  // Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingSession, setDeletingSession] = useState<ChatSession | null>(null);
  const [descEditing, setDescEditing] = useState<ChatSession | null>(null);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const newSessionsRef = useRef<Set<number>>(new Set());
  const activeSessionIdRef = useRef<number | null>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      const lastActiveId = activeSessionIdRef.current;
      const lastMessages = messagesRef.current;
      if (
        lastActiveId !== null &&
        newSessionsRef.current.has(lastActiveId) &&
        lastMessages.length === 0
      ) {
        api.delete(`/chat/sessions/${lastActiveId}`).catch((err) => {
          console.error('Failed to clean up empty session on unmount:', err);
        });
      }
    };
  }, []);

  // ─── Scroll ───────────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId !== null) {
      loadMessages(activeSessionId);
    } else {
      Promise.resolve().then(() => setMessages([]));
    }
  }, [activeSessionId]);

  // ─── Data Loading ─────────────────────────────────────────────────────────
  async function loadSessions() {
    try {
      setSessionsLoading(true);
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
    } catch {
      toast.error('Không thể tải danh sách cuộc hội thoại');
    } finally {
      setSessionsLoading(false);
    }
  }

  async function loadMessages(sessionId: number) {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}/messages`);
      setMessages(res.data);
    } catch {
      toast.error('Không thể tải tin nhắn');
    }
  }

  // ─── Session Actions ──────────────────────────────────────────────────────
  const handleNewSession = async () => {
    // Clean up current session if it was newly created and is empty
    const currentActiveId = activeSessionId;
    const currentMessages = messages;
    if (
      currentActiveId !== null &&
      newSessionsRef.current.has(currentActiveId) &&
      currentMessages.length === 0
    ) {
      try {
        await api.delete(`/chat/sessions/${currentActiveId}`);
        setSessions((prev) => prev.filter((s) => s.id !== currentActiveId));
        newSessionsRef.current.delete(currentActiveId);
      } catch (err) {
        console.error('Failed to delete empty session:', err);
      }
    }

    try {
      const res = await api.post('/chat/sessions');
      newSessionsRef.current.add(res.data.id);
      setSessions((prev) => [res.data, ...prev]);
      setActiveSessionId(res.data.id);
      setMessages([]);
      inputRef.current?.focus();
    } catch {
      toast.error('Không thể tạo cuộc hội thoại mới');
    }
  };

  const handleSelectSession = async (sessionId: number) => {
    if (activeSessionId === sessionId) return;

    // Clean up current session if it was newly created and is empty
    const currentActiveId = activeSessionId;
    const currentMessages = messages;
    if (
      currentActiveId !== null &&
      newSessionsRef.current.has(currentActiveId) &&
      currentMessages.length === 0
    ) {
      try {
        await api.delete(`/chat/sessions/${currentActiveId}`);
        setSessions((prev) => prev.filter((s) => s.id !== currentActiveId));
        newSessionsRef.current.delete(currentActiveId);
      } catch (err) {
        console.error('Failed to delete empty session:', err);
      }
    }

    setActiveSessionId(sessionId);
    setMessages([]);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setDeletingSession(session);
    }
  };

  const handleConfirmDeleteSession = async () => {
    if (!deletingSession) return;
    try {
      await api.delete(`/chat/sessions/${deletingSession.id}`);
      setSessions((prev) => prev.filter((s) => s.id !== deletingSession.id));
      if (activeSessionId === deletingSession.id) setActiveSessionId(null);
      toast.success('Đã xóa cuộc hội thoại');
    } catch {
      toast.error('Không thể xóa cuộc hội thoại');
    } finally {
      setDeletingSession(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await api.delete('/chat/sessions');
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      setShowDeleteAll(false);
      toast.success(`Đã xóa ${res.data.deleted} cuộc hội thoại`);
    } catch {
      toast.error('Không thể xóa tất cả');
      setShowDeleteAll(false);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/chat/sessions/${sessionId}/pin`);
      setSessions((prev) =>
        prev
          .map((s) => (s.id === sessionId ? { ...s, isPinned: res.data.isPinned } : s))
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            const ta = new Date(a.lastAccessedAt ?? a.updatedAt).getTime();
            const tb = new Date(b.lastAccessedAt ?? b.updatedAt).getTime();
            return tb - ta;
          })
      );
      toast.success(res.data.isPinned ? 'Đã ghim cuộc hội thoại' : 'Đã bỏ ghim');
    } catch {
      toast.error('Không thể thay đổi trạng thái ghim');
    }
  };

  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
  };

  const handleConfirmRename = async (newTitle: string) => {
    if (!editingId || !newTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await api.patch(`/chat/sessions/${editingId}/title`, { title: newTitle.trim() });
      setSessions((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, title: res.data.title } : s))
      );
      toast.success('Đã đổi tên cuộc hội thoại');
    } catch {
      toast.error('Không thể đổi tên');
    } finally {
      setEditingId(null);
    }
  };

  const handleSaveDescription = async (desc: string) => {
    if (!descEditing) return;
    try {
      const res = await api.patch(`/chat/sessions/${descEditing.id}/description`, {
        description: desc,
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === descEditing.id ? { ...s, description: res.data.description } : s))
      );
      toast.success('Đã lưu mô tả');
    } catch {
      toast.error('Không thể lưu mô tả');
    } finally {
      setDescEditing(null);
    }
  };

  const handleClearMessages = async () => {
    if (!activeSessionId) return;
    if (!confirm('Xóa toàn bộ tin nhắn trong cuộc hội thoại này?')) return;
    try {
      await api.delete(`/chat/sessions/${activeSessionId}/messages`);
      setMessages([]);
      toast.info('Đã xóa tin nhắn');
    } catch {
      toast.error('Không thể xóa tin nhắn');
    }
  };

  // ─── Send Message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const res = await api.post('/chat/sessions');
        sessionId = res.data.id;
        if (sessionId !== null) {
          newSessionsRef.current.add(sessionId);
        }
        setSessions((prev) => [res.data, ...prev]);
        setActiveSessionId(sessionId);
      } catch {
        toast.error('Không thể tạo phiên chat');
        return;
      }
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const payloadMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: userMessage.content },
      ];
      const res = await api.post('/chat', { messages: payloadMessages, sessionId });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.content }]);
      loadSessions();
    } catch {
      toast.error('Lỗi khi kết nối với AI. Vui lòng kiểm tra API Key.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng kiểm tra cấu hình API.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSuggestion = async (promptText: string) => {
    if (isLoading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const res = await api.post('/chat/sessions');
        sessionId = res.data.id;
        if (sessionId !== null) {
          newSessionsRef.current.add(sessionId);
        }
        setSessions((prev) => [res.data, ...prev]);
        setActiveSessionId(sessionId);
      } catch {
        toast.error('Không thể tạo phiên chat');
        return;
      }
    }

    const userMessage: Message = { role: 'user', content: promptText };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payloadMessages = [{ role: 'user' as const, content: promptText }];
      const res = await api.post('/chat', { messages: payloadMessages, sessionId });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.content }]);
      loadSessions();
    } catch {
      toast.error('Lỗi khi kết nối với AI. Vui lòng kiểm tra API Key.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng kiểm tra cấu hình API.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // formatMessageContent has been extracted to ChatMessages component

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Modals */}
      {showDeleteAll && (
        <DeleteAllModal
          count={sessions.length}
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteAll(false)}
        />
      )}
      {deletingSession && (
        <DeleteSessionModal
          sessionTitle={deletingSession.title}
          onConfirm={handleConfirmDeleteSession}
          onCancel={() => setDeletingSession(null)}
        />
      )}
      {descEditing && (
        <DescriptionEditor
          session={descEditing}
          onSave={handleSaveDescription}
          onClose={() => setDescEditing(null)}
        />
      )}
      {editingId !== null && sessions.find((s) => s.id === editingId) && (
        <RenameSessionModal
          initialTitle={sessions.find((s) => s.id === editingId)!.title}
          onConfirm={handleConfirmRename}
          onCancel={() => setEditingId(null)}
        />
      )}

      <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border border-border/50 bg-card">
          {/* ── Session Sidebar ──────────────────────────────────────────────── */}
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          sessionsLoading={sessionsLoading}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onTogglePin={handleTogglePin}
          onStartRename={handleStartRename}
          onDescEdit={setDescEditing}
          onShowDeleteAll={() => setShowDeleteAll(true)}
        />

        {/* ── Main Chat Area ───────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-card/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-background/60 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-foreground leading-tight truncate flex items-center gap-1.5">
                  {!!activeSession?.isPinned && (
                    <Pin className="size-3.5 text-amber-500 shrink-0" />
                  )}
                  {activeSession ? activeSession.title : 'Trợ lý AI thông minh'}
                </h1>
                {activeSession ? (
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {activeSession.description && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                        {activeSession.description}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1 shrink-0">
                      <Calendar className="size-3" />
                      {activeSession.lastAccessedAt
                        ? formatRelativeTime(activeSession.lastAccessedAt)
                        : formatRelativeTime(activeSession.createdAt)}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground/85 mt-0.5">
                    Tích hợp OpenRouter · DeepSeek AI
                  </p>
                )}
              </div>
            </div>
            {activeSessionId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearMessages}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg shrink-0 cursor-pointer transition-colors"
                title="Xóa tin nhắn"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>

          {/* Messages */}
          <ChatMessages
            activeSessionId={activeSessionId}
            messages={messages}
            isLoading={isLoading}
            onNewSession={handleNewSession}
            onSendSuggestion={handleSendSuggestion}
            chatEndRef={chatEndRef}
          />

          {/* Input bar */}
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSend}
            isLoading={isLoading}
            inputRef={inputRef}
          />
          </div>
        </div>
      </div>
    </>
  );
}

// SessionItem is now imported from components
