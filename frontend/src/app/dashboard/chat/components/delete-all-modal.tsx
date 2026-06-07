'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteAllModalProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAllModal({ count, onConfirm, onCancel }: DeleteAllModalProps) {
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
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="gap-1.5 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa tất cả ({count})
          </Button>
        </div>
      </div>
    </div>
  );
}
