'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Plus,
  MessageSquare,
  Pencil,
  Check,
  X,
  Clock,
  ChevronRight,
  Pin,
  PinOff,
  AlertTriangle,
  FileText,
  Calendar,
  Globe,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

// ─── DeleteAll Confirm Modal ──────────────────────────────────────────────────

function DeleteAllModal({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Xóa tất cả lịch sử</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Bạn sẽ xóa vĩnh viễn{' '}
          <span className="font-semibold text-foreground">{count} cuộc hội thoại</span> và tất cả
          tin nhắn bên trong. Hành động này{' '}
          <span className="text-destructive font-medium">không thể hoàn tác</span>.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Xóa tất cả ({count})
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Description Edit Popover ─────────────────────────────────────────────────

function DescriptionEditor({
  session,
  onSave,
  onClose,
}: {
  session: ChatSession;
  onSave: (desc: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(session.description ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 max-w-sm w-full animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Mô tả cuộc hội thoại</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Thêm ghi chú ngắn để dễ nhớ nội dung phiên chat này.
        </p>
        <textarea
          className="w-full h-24 text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="VD: Phân tích doanh thu Q3, chiến lược tăng trưởng..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          maxLength={300}
        />
        <p className="text-[10px] text-muted-foreground text-right mt-1">{value.length}/300</p>
        <div className="flex gap-2 justify-end mt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button size="sm" onClick={() => onSave(value)} className="gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Suggestions for New Session ──────────────────────────────────────────
const SUGGESTIONS = [
  {
    title: 'Phân tích doanh thu chi nhánh',
    description: 'Phân tích tình hình doanh thu của các chi nhánh trong tháng qua và nhận xét.',
    prompt: 'Phân tích tình hình doanh thu của các chi nhánh trong tháng qua và đưa ra nhận xét chi tiết.',
    icon: <Globe className="size-5 text-blue-500" />,
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Dự báo doanh thu AI',
    description: 'Dự báo xu hướng doanh thu tháng tới dựa trên các số liệu hiện tại.',
    prompt: 'Dự báo xu hướng doanh thu cho tháng tiếp theo dựa trên các số liệu hiện tại và gợi ý giải pháp cải thiện.',
    icon: <TrendingUp className="size-5 text-purple-500" />,
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Sản phẩm bán chạy nhất',
    description: 'Phân tích danh sách sản phẩm mang lại doanh thu tốt nhất thời gian qua.',
    prompt: 'Tìm kiếm và phân tích các sản phẩm mang lại doanh thu tốt nhất thời gian qua.',
    icon: <BarChart3 className="size-5 text-emerald-500" />,
    bgColor: 'bg-emerald-500/10',
  },
  {
    title: 'Hiệu suất hoạt động nhà kho',
    description: 'So sánh sản lượng và hiệu suất hoạt động giữa các nhà kho/nhà máy.',
    prompt: 'So sánh hiệu suất hoạt động và doanh thu phân bổ của các nhà kho/nhà máy.',
    icon: <Calendar className="size-5 text-amber-500" />,
    bgColor: 'bg-amber-500/10',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatAssistantPage() {
  // Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [descEditing, setDescEditing] = useState<ChatSession | null>(null);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (activeSessionId !== null) loadMessages(activeSessionId);
    else setMessages([]);
  }, [activeSessionId]);

  // ─── Data Loading ─────────────────────────────────────────────────────────
  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
    } catch {
      toast.error('Không thể tải danh sách cuộc hội thoại');
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadMessages = async (sessionId: number) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}/messages`);
      setMessages(res.data);
    } catch {
      toast.error('Không thể tải tin nhắn');
    }
  };

  // ─── Session Actions ──────────────────────────────────────────────────────
  const handleNewSession = async () => {
    try {
      const res = await api.post('/chat/sessions');
      setSessions((prev) => [res.data, ...prev]);
      setActiveSessionId(res.data.id);
      setMessages([]);
      inputRef.current?.focus();
    } catch {
      toast.error('Không thể tạo cuộc hội thoại mới');
    }
  };

  const handleSelectSession = (sessionId: number) => {
    if (activeSessionId === sessionId) return;
    setActiveSessionId(sessionId);
    setMessages([]);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    if (!confirm('Xóa cuộc hội thoại này?')) return;
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) setActiveSessionId(null);
      toast.success('Đã xóa cuộc hội thoại');
    } catch {
      toast.error('Không thể xóa cuộc hội thoại');
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
    setEditTitle(session.title);
  };

  const handleConfirmRename = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!editingId || !editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await api.patch(`/chat/sessions/${editingId}/title`, { title: editTitle.trim() });
      setSessions((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, title: res.data.title } : s))
      );
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
      const payloadMessages = [
        { role: 'user' as const, content: promptText },
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

  // ─── Format Message ───────────────────────────────────────────────────────
  const formatMessageContent = (text: string) => {
    if (!text) return '';
    const parts = text.split(/```/);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        const lines = part.split('\n');
        const firstLine = lines[0].trim();
        const isLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const codeContent = isLang ? lines.slice(1).join('\n') : part;
        return (
          <pre
            key={idx}
            className="my-3 p-4 bg-zinc-950 text-zinc-100 rounded-xl overflow-x-auto text-xs font-mono border border-white/5"
          >
            {isLang && (
              <div className="text-[10px] text-zinc-400 font-bold uppercase mb-2 border-b border-white/5 pb-1">
                {firstLine}
              </div>
            )}
            <code>{codeContent}</code>
          </pre>
        );
      }
      const subParts = part.split('\n').map((line, lIdx) => {
        let renderedLine: React.ReactNode = line;
        if (line.includes('**')) {
          const boldParts = line.split(/\*\*/);
          renderedLine = boldParts.map((bp, bpIdx) =>
            bpIdx % 2 === 1 ? (
              <strong key={bpIdx} className="font-bold text-foreground">
                {bp}
              </strong>
            ) : (
              bp
            )
          );
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <li
              key={lIdx}
              className="ml-5 list-disc my-1 text-sm leading-relaxed text-foreground/90"
            >
              {typeof renderedLine === 'string' ? line.trim().substring(2) : renderedLine}
            </li>
          );
        }
        return (
          <p key={lIdx} className="min-h-[1.25rem] text-sm leading-relaxed my-1 text-foreground/90">
            {renderedLine}
          </p>
        );
      });
      return <div key={idx}>{subParts}</div>;
    });
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const pinnedSessions = sessions.filter((s) => s.isPinned);
  const unpinnedSessions = sessions.filter((s) => !s.isPinned);

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
      {descEditing && (
        <DescriptionEditor
          session={descEditing}
          onSave={handleSaveDescription}
          onClose={() => setDescEditing(null)}
        />
      )}

      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* ── Session Sidebar ──────────────────────────────────────────────── */}
        <aside
          className="w-68 shrink-0 flex flex-col border-r border-border bg-muted/10 dark:bg-card/20 backdrop-blur-sm"
          style={{ width: '272px' }}
        >
          {/* Header */}
          <div className="p-3 border-b border-border space-y-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1 uppercase tracking-wider">
              <MessageSquare className="size-3.5 text-blue-500" />
              Lịch sử hội thoại
            </span>
            <Button
              onClick={handleNewSession}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 rounded-xl h-9 text-xs"
            >
              <Plus className="size-4" />
              Cuộc hội thoại mới
            </Button>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {sessionsLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground font-medium">Chưa có cuộc hội thoại</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Nhấn nút bên trên để bắt đầu</p>
              </div>
            ) : (
              <div className="p-2.5 space-y-3">
                {/* Pinned group */}
                {pinnedSessions.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                      <Pin className="h-2.5 w-2.5" /> Đã ghim
                    </p>
                    <div className="space-y-0.5">
                      {pinnedSessions.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          isActive={activeSessionId === session.id}
                          editingId={editingId}
                          editTitle={editTitle}
                          setEditTitle={setEditTitle}
                          onSelect={handleSelectSession}
                          onDelete={handleDeleteSession}
                          onPin={handleTogglePin}
                          onRename={handleStartRename}
                          onConfirmRename={handleConfirmRename}
                          onCancelRename={() => setEditingId(null)}
                          onDescEdit={setDescEditing}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unpinned group */}
                {unpinnedSessions.length > 0 && (
                  <div>
                    {pinnedSessions.length > 0 && (
                      <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-1.5">
                        Tất cả
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {unpinnedSessions.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          isActive={activeSessionId === session.id}
                          editingId={editingId}
                          editTitle={editTitle}
                          setEditTitle={setEditTitle}
                          onSelect={handleSelectSession}
                          onDelete={handleDeleteSession}
                          onPin={handleTogglePin}
                          onRename={handleStartRename}
                          onConfirmRename={handleConfirmRename}
                          onCancelRename={() => setEditingId(null)}
                          onDescEdit={setDescEditing}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2 space-y-1.5">
            <p className="text-[10px] text-muted-foreground text-center">
              {sessions.length} cuộc hội thoại · {pinnedSessions.length} đã ghim
            </p>
            {sessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAll(true)}
                className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa tất cả lịch sử
              </Button>
            )}
          </div>
        </aside>

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
                  {activeSession?.isPinned && <Pin className="size-3.5 text-amber-500 shrink-0" />}
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar">
            {!activeSessionId && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-4 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="size-16 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center animate-pulse">
                  <Sparkles className="size-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Bắt đầu cuộc hội thoại mới
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Hỏi tôi bất cứ điều gì về doanh thu, phân tích dữ liệu hoặc chiến lược kinh doanh của bạn.
                  </p>
                </div>
                <Button
                  onClick={handleNewSession}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/15 cursor-pointer flex items-center gap-2 rounded-xl px-5 h-10"
                >
                  <Plus className="size-4" />
                  Tạo cuộc hội thoại
                </Button>
              </div>
            )}

            {activeSessionId && messages.length === 0 && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-start animate-in fade-in duration-300">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
                  <Bot className="size-4.5" />
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <Card className="border border-border bg-card shadow-xs rounded-2xl overflow-hidden">
                    <CardContent className="p-5">
                      <p className="text-sm leading-relaxed text-foreground/90 font-medium mb-3">
                        Xin chào! Tôi là Trợ lý AI Phân tích Doanh thu. Hãy hỏi tôi bất cứ điều gì hoặc chọn nhanh các gợi ý phân tích chi tiết dưới đây:
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 mt-4">
                        {SUGGESTIONS.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendSuggestion(sug.prompt)}
                            className="flex flex-col items-start text-left p-4 rounded-xl border border-border bg-muted/20 hover:bg-blue-500/5 hover:border-blue-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={cn("p-1.5 rounded-lg shrink-0", sug.bgColor)}>
                                {sug.icon}
                              </div>
                              <span className="text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {sug.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {sug.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={msg.id ?? idx}
                className={cn(
                  'flex gap-3 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
                  'animate-in fade-in duration-300'
                )}
              >
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-xl shadow-sm',
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  )}
                >
                  {msg.role === 'user' ? <User className="size-4.5" /> : <Bot className="size-4.5" />}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Card
                    className={cn(
                      'border shadow-xs rounded-2xl overflow-hidden',
                      msg.role === 'user'
                        ? 'bg-blue-500/5 border-blue-500/15'
                        : 'bg-card border-border'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-1">{formatMessageContent(msg.content)}</div>
                    </CardContent>
                  </Card>
                  {msg.createdAt && (
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1 px-1">
                      <Clock className="size-2.5" />
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-start animate-in fade-in duration-300">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm animate-pulse">
                  <Bot className="size-4.5" />
                </div>
                <Card className="bg-card border border-border shadow-xs rounded-2xl">
                  <CardContent className="p-4 py-3 flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full bg-blue-600/70 animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="size-2 rounded-full bg-blue-600/70 animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="size-2 rounded-full bg-blue-600/70 animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div className="shrink-0 border-t border-border px-6 py-4 bg-background/60 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 relative items-center max-w-4xl mx-auto w-full"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi trợ lý AI về doanh thu, dự báo hoặc giải pháp bán hàng..."
                className="flex-1 bg-background text-foreground border-border pr-14 h-12 rounded-2xl focus-visible:ring-blue-500/30 focus-visible:ring-3 focus-visible:border-blue-500 shadow-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all shadow-md shadow-blue-500/15 flex items-center justify-center"
                disabled={!input.trim() || isLoading}
              >
                <Send className="size-4" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground/80 text-center mt-2">
              Tin nhắn được lưu tự động · AI có thể mắc lỗi, hãy kiểm tra thông tin quan trọng
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Session Item Component ───────────────────────────────────────────────────

function SessionItem({
  session,
  isActive,
  editingId,
  editTitle,
  setEditTitle,
  onSelect,
  onDelete,
  onPin,
  onRename,
  onConfirmRename,
  onCancelRename,
  onDescEdit,
}: {
  session: ChatSession;
  isActive: boolean;
  editingId: number | null;
  editTitle: string;
  setEditTitle: (v: string) => void;
  onSelect: (id: number) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onPin: (e: React.MouseEvent, id: number) => void;
  onRename: (e: React.MouseEvent, s: ChatSession) => void;
  onConfirmRename: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onCancelRename: () => void;
  onDescEdit: (s: ChatSession) => void;
}) {
  const lastTime = session.lastAccessedAt ?? session.updatedAt;

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={cn(
        'group relative rounded-xl px-3 py-2.5 cursor-pointer transition-all border border-transparent flex flex-col min-w-0',
        isActive
          ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs'
          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-500 rounded-r-full" />
      )}

      {editingId === session.id ? (
        /* ── Edit mode ── */
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirmRename(e);
              if (e.key === 'Escape') onCancelRename();
            }}
            autoFocus
            className="h-7 text-xs px-2 py-0.5 flex-1 bg-background border-border"
          />
          <button onClick={onConfirmRename} className="text-green-500 hover:text-green-400 p-1 hover:bg-muted rounded transition-colors cursor-pointer">
            <Check className="size-3.5" />
          </button>
          <button
            onClick={onCancelRename}
            className="text-muted-foreground hover:text-destructive p-1 hover:bg-muted rounded transition-colors cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        /* ── Normal mode ── */
        <div className="flex flex-col min-w-0">
          {/* Top row: icon + title + actions */}
          <div className="flex items-center gap-2 min-w-0">
            {session.isPinned ? (
              <Pin className="size-3.5 shrink-0 text-amber-500" />
            ) : (
              <MessageSquare
                className={cn(
                  'size-3.5 shrink-0',
                  isActive ? 'text-blue-500' : 'text-muted-foreground'
                )}
              />
            )}
            <span
              className={cn(
                'flex-1 text-xs font-semibold truncate',
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-foreground/90'
              )}
            >
              {session.title}
            </span>

            {/* Action buttons (visible on hover or active) */}
            <div
              className={cn(
                'flex items-center gap-0.5 shrink-0 transition-opacity',
                'opacity-0 group-hover:opacity-100',
                isActive && 'opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => onPin(e, session.id)}
                className={cn(
                  'p-1 rounded-md hover:bg-muted transition-all cursor-pointer',
                  session.isPinned ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'
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
                className="p-1 rounded-md text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer"
                title="Thêm mô tả"
              >
                <FileText className="size-3" />
              </button>
              <button
                onClick={(e) => onRename(e, session)}
                className="p-1 rounded-md text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer"
                title="Đổi tên"
              >
                <Pencil className="size-3" />
              </button>
              <button
                onClick={(e) => onDelete(e, session.id)}
                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                title="Xóa"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>

          {/* Description */}
          {session.description && (
            <p className="text-[10px] text-muted-foreground truncate mt-1 ml-5.5 leading-relaxed">
              {session.description}
            </p>
          )}

          {/* Last accessed time */}
          <div className="flex items-center gap-1 mt-1 ml-5.5">
            <Clock className="size-3 text-muted-foreground/40 shrink-0" />
            <span className="text-[10px] text-muted-foreground/45 truncate">
              {formatRelativeTime(lastTime)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
