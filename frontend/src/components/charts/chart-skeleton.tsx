'use client';

import * as React from 'react';
import { BarChart3Icon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  height?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  className?: string;
}

const HEIGHTS = {
  sm: 'h-[200px]',
  md: 'h-[280px]',
  lg: 'h-[320px]',
};

export function ChartSkeleton({
  height = 'md',
  showLegend = false,
  className,
}: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        'w-full rounded-xl border border-dashed border-border bg-muted/5 flex flex-col items-center justify-center gap-3',
        HEIGHTS[height],
        className
      )}
    >
      <Loader2Icon className="size-8 text-muted-foreground/40 animate-spin" />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BarChart3Icon className="size-3.5" />
        <span>Đang tải dữ liệu biểu đồ…</span>
      </div>
      {showLegend && (
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-muted-foreground/30 animate-pulse" />
            <div className="h-2.5 w-12 rounded-sm bg-muted-foreground/20 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-muted-foreground/30 animate-pulse" />
            <div className="h-2.5 w-12 rounded-sm bg-muted-foreground/20 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
