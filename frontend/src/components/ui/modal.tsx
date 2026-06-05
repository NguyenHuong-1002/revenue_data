'use client';

// ===== Component Modal dùng chung hệ thống =====
// Thiết kế tối giản, điểm nhấn chỉ thị màu sắc bên trái tiêu đề.
// Hỗ trợ đóng bằng phím Escape, khóa scroll màn hình và các biến thể ngữ cảnh.

import { X } from 'lucide-react';
import * as React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'info' | 'danger' | 'warning' | 'success';
}

function getVariantStyles(variant: ModalProps['variant']) {
  switch (variant) {
    case 'danger':
      return 'bg-rose-600 dark:bg-rose-500';
    case 'warning':
      return 'bg-amber-500';
    case 'success':
      return 'bg-emerald-600 dark:bg-emerald-500';
    case 'info':
    case 'default':
    default:
      return 'bg-blue-600 dark:bg-blue-500';
  }
}

export function Modal({ isOpen, onClose, title, children, variant = 'default' }: ModalProps) {
  // Bắt sự kiện phím Escape để đóng modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Khóa scroll nền
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset'; // Phục hồi scroll
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const accentClass = getVariantStyles(variant);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Lớp nền mờ tối giản (Minimalist Backdrop) */}
      <div
        className="fixed inset-0 bg-slate-950/45 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Hộp modal thiết kế cân đối và tinh tế */}
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-[0_15px_45px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-6 overflow-hidden animate-in fade-in zoom-in-98 slide-in-from-bottom-2 duration-300 z-10">
        {/* Header: Điểm nhấn tối giản + Tiêu đề + Nút đóng */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            {/* Thanh định vị màu sắc làm điểm nhấn thanh lịch */}
            <div className={`h-5 w-1 rounded-full shrink-0 ${accentClass}`} />
            <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-150 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nội dung bên trong modal */}
        <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
      </div>
    </div>
  );
}
