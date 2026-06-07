'use client';

import * as React from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';

export interface UploadState {
  file: File | null;
  loading: boolean;
  success: boolean;
  error: string | null;
  stats: {
    total: number;
    inserted: number;
    skipped: number;
  } | null;
}

interface UploadStatusProps {
  state: UploadState;
  colorClasses?: {
    text: string;
    bg: string;
    border: string;
    buttonHover: string;
  };
  onReset: () => void;
}

export function UploadStatus({ state, onReset }: UploadStatusProps) {
  if (state.loading) {
    return (
      <Modal
        isOpen={true}
        onClose={() => {}} // Không cho phép đóng bằng phím ESC hoặc kích bên ngoài khi đang upload
        title="Đang nhập dữ liệu"
        variant="info"
      >
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Đang tải tệp tin và xử lý...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Vui lòng đợi trong giây lát, hệ thống đang đồng bộ dữ liệu vào cơ sở dữ liệu.
            </p>
          </div>
          <Skeleton className="h-1.5 w-full rounded-full mt-2" />
        </div>
      </Modal>
    );
  }

  if (state.success && state.stats) {
    return (
      <Modal isOpen={true} onClose={onReset} title="Nhập dữ liệu thành công" variant="success">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            <span>Tệp tin đã được xử lý hoàn tất!</span>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-muted/20">
            <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center py-2">
              <div>Tổng bản ghi</div>
              <div>Đã thêm mới</div>
              <div>Đã bỏ qua</div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border text-center py-3 font-semibold text-sm">
              <div className="text-foreground">{state.stats.total}</div>
              <div className="text-emerald-600 dark:text-emerald-400">+{state.stats.inserted}</div>
              <div className="text-amber-600 dark:text-amber-500">{state.stats.skipped}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              onClick={onReset}
              className="rounded-xl px-4 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Đồng ý
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (state.error) {
    return (
      <Modal isOpen={true} onClose={onReset} title="Nhập dữ liệu thất bại" variant="danger">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            <span>Có lỗi xảy ra trong quá trình xử lý:</span>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 font-mono text-xs text-rose-600 dark:text-rose-400 break-words leading-relaxed max-h-[160px] overflow-y-auto">
            {state.error}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={onReset} variant="outline" className="rounded-xl px-4 cursor-pointer">
              Đóng
            </Button>
            <Button
              onClick={onReset}
              className="rounded-xl px-4 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}
