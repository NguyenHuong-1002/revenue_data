'use client';

import { Send, Sparkles } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ChatInput({ input, setInput, onSubmit, isLoading, inputRef }: ChatInputProps) {
  return (
    <div className="shrink-0 border-t border-border/40 px-6 py-4 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="relative flex items-center max-w-4xl mx-auto w-full group"
      >
        {/* Decorative Sparkles Icon */}
        <div className="absolute left-3.5 text-muted-foreground/50 z-10 pointer-events-none group-focus-within:text-blue-500 transition-colors duration-200">
          <Sparkles className="size-4" />
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi trợ lý AI về doanh thu, dự báo hoặc giải pháp bán hàng..."
          className="flex-1 bg-background/90 text-sm text-foreground border-border/80 pr-14 pl-10 h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 shadow-sm transition-all duration-200"
          disabled={isLoading}
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          className={cn(
            'absolute right-1.5 h-9 w-9 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm border-0',
            input.trim() && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:scale-102'
              : 'bg-muted text-muted-foreground/35 cursor-not-allowed'
          )}
          disabled={!input.trim() || isLoading}
        >
          <Send className="size-4" />
        </Button>
      </form>
      <p className="text-[10px] text-muted-foreground/60 text-center mt-2.5 font-medium leading-relaxed">
        Tin nhắn được lưu tự động · AI có thể đưa ra câu trả lời không chính xác, vui lòng kiểm tra
        thông tin quan trọng.
      </p>
    </div>
  );
}
