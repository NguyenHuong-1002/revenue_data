'use client';

import { Database, RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
}

export function InventoryHeader({ refreshing, onRefresh }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-chart-5/8 blur-2xl"
      />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md">
            <Database className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Thống kê & Dự báo Kho hàng
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <Activity className="h-2.5 w-2.5" /> Live
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Phân tích toàn diện tình trạng tồn kho theo nhà máy, sản phẩm và dự báo xu hướng
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className={cn(
            'h-9 gap-2 rounded-xl border-primary/40 text-primary',
            'hover:bg-primary/5 hover:border-primary/60 cursor-pointer transition-all duration-200',
            refreshing && 'opacity-70'
          )}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          Làm mới
        </Button>
      </div>
    </div>
  );
}
