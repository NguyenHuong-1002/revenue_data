'use client';

import {
  Sparkles,
  Plus,
  Bot,
  User,
  Clock,
  Globe,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

interface ChatMessagesProps {
  activeSessionId: number | null;
  messages: Message[];
  isLoading: boolean;
  onNewSession: () => void;
  onSendSuggestion: (prompt: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const SUGGESTIONS = [
  {
    title: 'Phân tích doanh thu chi nhánh',
    description: 'Phân tích tình hình doanh thu của các chi nhánh trong tháng qua và nhận xét.',
    prompt:
      'Phân tích tình hình doanh thu của các chi nhánh trong tháng qua và đưa ra nhận xét chi tiết.',
    icon: <Globe className="size-5 text-blue-500" />,
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Dự báo doanh thu AI',
    description: 'Dự báo xu hướng doanh thu tháng tới dựa trên các số liệu hiện tại.',
    prompt:
      'Dự báo xu hướng doanh thu cho tháng tiếp theo dựa trên các số liệu hiện tại và gợi ý giải pháp cải thiện.',
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
        <div
          key={idx}
          className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md"
        >
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">
            <span>{isLang ? firstLine : 'code'}</span>
            <span className="text-[9px] text-zinc-500">Source code</span>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
            <code>{codeContent}</code>
          </pre>
        </div>
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
          <li key={lIdx} className="ml-5 list-disc my-1 text-sm leading-relaxed text-foreground/90">
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

export function ChatMessages({
  activeSessionId,
  messages,
  isLoading,
  onNewSession,
  onSendSuggestion,
  chatEndRef,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar">
      {/* Case 1: No Session Selected */}
      {!activeSessionId && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-125 animate-pulse" />
            <div className="relative size-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="size-8 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
              Trợ lý Doanh thu AI
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Hỏi bất kỳ thông tin nào về doanh số, phân tích dữ liệu, hoạt động nhà kho hoặc chiến
              lược tăng trưởng chi nhánh.
            </p>
          </div>
          <Button
            onClick={onNewSession}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2 rounded-xl px-6 h-11 border-0"
          >
            <Plus className="size-4 stroke-[2.5]" />
            Bắt đầu cuộc trò chuyện
          </Button>
        </div>
      )}

      {/* Case 2: Session Selected but Empty Messages (Suggestions list) */}
      {activeSessionId && messages.length === 0 && (
        <div className="flex gap-4 max-w-[85%] mr-auto items-start animate-in fade-in duration-350">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/10">
            <Bot className="size-5" />
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm leading-relaxed text-foreground font-semibold">
                    Xin chào! Tôi là Trợ lý AI Phân tích Doanh thu.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tôi có thể truy cập dữ liệu hệ thống để giúp bạn báo cáo và phân tích. Chọn một
                    trong các gợi ý dưới đây để bắt đầu nhanh:
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => onSendSuggestion(sug.prompt)}
                      className="flex flex-col items-start text-left p-4 rounded-xl border border-border bg-muted/15 hover:bg-blue-500/5 hover:border-blue-500/20 hover:shadow-xs transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div
                          className={cn(
                            'p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-105',
                            sug.bgColor
                          )}
                        >
                          {sug.icon}
                        </div>
                        <span className="text-xs font-bold text-foreground/95 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {sug.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {sug.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case 3: Messages Thread */}
      {messages.map((msg, idx) => (
        <div
          key={msg.id ?? idx}
          className={cn(
            'flex gap-3.5 max-w-[85%] items-start',
            msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
            'animate-in fade-in slide-in-from-bottom-2 duration-300'
          )}
        >
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform hover:scale-105',
              msg.role === 'user'
                ? 'bg-blue-600 text-white shadow-blue-500/10'
                : 'bg-indigo-600 text-white shadow-indigo-500/10'
            )}
          >
            {msg.role === 'user' ? <User className="size-4.5" /> : <Bot className="size-4.5" />}
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <Card
              className={cn(
                'border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
                msg.role === 'user'
                  ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/15 dark:border-blue-500/20'
                  : 'bg-card border-border/80'
              )}
            >
              <CardContent className="p-4 min-w-0">
                <div className="space-y-1">{formatMessageContent(msg.content)}</div>
              </CardContent>
            </Card>
            {msg.createdAt && (
              <span
                className={cn(
                  'text-[9px] text-muted-foreground/60 flex items-center gap-1 px-1 font-semibold',
                  msg.role === 'user' && 'justify-end'
                )}
              >
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

      {/* Case 4: Thinking Spinner */}
      {isLoading && (
        <div className="flex gap-3.5 max-w-[80%] mr-auto items-start animate-in fade-in duration-300">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm animate-pulse">
            <Bot className="size-4.5" />
          </div>
          <Card className="bg-card border border-border/80 shadow-xs rounded-2xl">
            <CardContent className="p-4 py-3 flex items-center gap-1.5">
              <div className="flex gap-1">
                <span className="size-2 rounded-full bg-blue-500/75 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-2 rounded-full bg-blue-500/75 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-2 rounded-full bg-blue-500/75 animate-bounce" />
              </div>
              <span className="text-xs text-muted-foreground/85 ml-2 font-medium">
                AI đang xử lý...
              </span>
            </CardContent>
          </Card>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
