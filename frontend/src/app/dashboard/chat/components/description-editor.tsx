'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, FileText, Sparkles } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatSession {
  id: number;
  title: string;
  description: string | null;
  isPinned: boolean;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DescriptionEditorProps {
  session: ChatSession;
  onSave: (desc: string) => void;
  onClose: () => void;
}

export function DescriptionEditor({ session, onSave, onClose }: DescriptionEditorProps) {
  const [value, setValue] = useState(session.description ?? '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAutoSummarize = async (showToast = true) => {
    try {
      setIsGenerating(true);
      const resMessages = await api.get(`/chat/sessions/${session.id}/messages`);
      const msgs = resMessages.data;
      if (!msgs || msgs.length === 0) {
        if (showToast) {
          toast.info('Chưa có tin nhắn nào trong hội thoại để tóm tắt.');
        }
        return;
      }

      const prompt = `Hãy tóm tắt cuộc hội thoại sau thành một mô tả ngắn gọn (tối đa 15 từ, bằng tiếng Việt, viết tự nhiên dạng ghi chú như "Phân tích doanh thu..." hoặc "Tìm hiểu sản phẩm..."). Trả về TRỰC TIẾP câu tóm tắt, không thêm bất kỳ nhãn nào như "Tóm tắt:", "Mô tả:" hay lời mở đầu nào khác.\n\nNội dung cuộc hội thoại:\n${msgs
        .map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.content}`)
        .join('\n')}`;

      const res = await api.post('/chat', {
        messages: [{ role: 'user', content: prompt }],
      });

      if (res.data?.content) {
        // Remove quotes if the AI wrapped the response in quotes
        const cleanedContent = res.data.content.trim().replace(/^["']|["']$/g, '');
        setValue(cleanedContent);
        if (showToast) {
          toast.success('Đã tự động tóm tắt bằng AI');
        }
      }
    } catch (err) {
      console.error('Lỗi tự động tóm tắt:', err);
      if (showToast) {
        toast.error('Không thể tóm tắt tự động bằng AI');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Tự động tóm tắt khi mở modal nếu chưa có mô tả
    if (!session.description) {
      handleAutoSummarize(false);
    }
  }, [session.id]);

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
        <div className="relative">
          <textarea
            className="w-full h-24 text-sm border border-border rounded-xl px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-75"
            placeholder={
              isGenerating
                ? 'AI đang đọc tin nhắn và tóm tắt...'
                : 'VD: Phân tích doanh thu Q3, chiến lược tăng trưởng...'
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            maxLength={300}
            disabled={isGenerating}
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                <span>AI đang phân tích & tóm tắt...</span>
              </div>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground text-right mt-1">{value.length}/300</p>
        <div className="flex justify-between items-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAutoSummarize(true)}
            disabled={isGenerating}
            className="text-[11px] text-blue-600 hover:text-blue-500 hover:bg-blue-500/10 gap-1 rounded-lg px-2 h-7 font-semibold cursor-pointer"
          >
            <Sparkles className={cn('h-3.5 w-3.5 text-blue-500', isGenerating && 'animate-spin')} />
            {isGenerating ? 'Đang tóm tắt...' : 'AI Tóm tắt'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isGenerating}>
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={() => onSave(value)}
              className="gap-1.5 cursor-pointer"
              disabled={isGenerating}
            >
              <Check className="h-3.5 w-3.5" />
              Lưu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
