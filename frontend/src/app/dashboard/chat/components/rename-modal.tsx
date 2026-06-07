'use client';

import { Edit3, Check } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RenameSessionModalProps {
  initialTitle: string;
  onConfirm: (newTitle: string) => void;
  onCancel: () => void;
}

export function RenameSessionModal({ initialTitle, onConfirm, onCancel }: RenameSessionModalProps) {
  const [title, setTitle] = useState(initialTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onConfirm(title.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Edit3 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Đổi tên cuộc hội thoại</h3>
        </div>

        <div className="space-y-1.5 mb-6">
          <label className="text-xs text-muted-foreground font-semibold">
            Tên cuộc hội thoại mới
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên hội thoại..."
            autoFocus
            className="h-10 text-sm px-3 bg-background border-border focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Hủy
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim()}
            className="gap-1.5 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
