'use client';

import { RefreshCw, CalendarRange, TrendingUp, Sparkles } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RevenueStatsHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
  selectedRange: string;
  onRangeChange: (range: string) => void;
  showControls?: boolean;
}

export function RevenueStatsHeader({
  refreshing,
  onRefresh,
  selectedRange,
  onRangeChange,
  showControls = true,
}: RevenueStatsHeaderProps) {
  const ranges = [
    { key: '7days', label: '7 ngày' },
    { key: '1month', label: '1 tháng' },
    { key: '3months', label: '3 tháng' },
    { key: '6months', label: '6 tháng' },
    { key: '1year', label: '1 năm' },
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      {/* Decorative background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-500/8 blur-2xl"
      />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* Left: Title block */}
        <div className="flex items-start gap-4">
          {/* Icon badge */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>

          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Thống kê &amp; Phân tích doanh thu
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                <Sparkles className="h-2.5 w-2.5" />
                Live
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Báo cáo tổng quan hoạt động tài chính, tốc độ tăng trưởng và hiệu suất bán hàng
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        {showControls && (
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Date Filter Pills */}
            <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/50 p-1 backdrop-blur-sm">
              <div className="px-1.5 text-muted-foreground/70">
                <CalendarRange className="h-3.5 w-3.5" />
              </div>
              {ranges.map((r) => (
                <button
                  key={r.key}
                  onClick={() => onRangeChange(r.key)}
                  className={cn(
                    'relative cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                    selectedRange === r.key
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              className={cn(
                'h-9 cursor-pointer gap-2 rounded-xl border-border/60 shadow-sm transition-all duration-200',
                'hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-500',
                refreshing && 'opacity-70'
              )}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              <span>Làm mới</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
