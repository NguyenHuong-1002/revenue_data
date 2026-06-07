'use client';

import { BarChart3Icon } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ChartHeight = 'sm' | 'md' | 'lg' | 'auto';

export const CHART_HEIGHTS: Record<ChartHeight, string> = {
  sm: 'h-[200px]',
  md: 'h-[280px]',
  lg: 'h-[320px]',
  auto: 'h-auto',
};

interface ChartCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  height?: ChartHeight | number;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  icon,
  actions,
  height = 'md',
  isEmpty = false,
  emptyMessage = 'Không có dữ liệu',
  className,
  onClick,
  children,
}: ChartCardProps) {
  const heightClass = typeof height === 'number' ? `h-[${height}px]` : CHART_HEIGHTS[height];

  return (
    <Card
      onClick={onClick}
      className={cn(
        'border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col',
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-border/60 py-3.5 px-5">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              {typeof title === 'string' ? <span className="truncate block">{title}</span> : title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs mt-0.5 line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        {isEmpty ? (
          <ChartEmpty heightClass={heightClass} message={emptyMessage} />
        ) : (
          <div className={cn('w-full', heightClass)}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

interface ChartEmptyProps {
  heightClass?: string;
  message?: string;
  className?: string;
}

export function ChartEmpty({
  heightClass = CHART_HEIGHTS.md,
  message = 'Không có dữ liệu',
  className,
}: ChartEmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border border-dashed border-border rounded-xl text-xs text-muted-foreground bg-muted/5',
        heightClass,
        className
      )}
    >
      <BarChart3Icon className="size-8 mb-2 opacity-30" />
      <span>{message}</span>
    </div>
  );
}
