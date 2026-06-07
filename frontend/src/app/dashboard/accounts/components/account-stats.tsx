'use client';

import { Users, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountStatsProps {
  stats: {
    total: number; // Tổng số tài khoản
    pctChange: number; // % thay đổi so với kỳ trước
    growthRate: number; // Tốc độ tăng trưởng
    activeCount: number; // Số tài khoản đang hoạt động
    activeRatio: number; // Tỉ lệ % tài khoản hoạt động
    newThisMonth: number; // Số tài khoản mới trong kỳ
  };
  timeRange: string;
  isLoading?: boolean;
}

function getPeriodLabel(timeRange: string) {
  switch (timeRange) {
    case '7d':
      return {
        compare: 'so với 7 ngày trước',
        growth: 'Tăng trưởng 7 ngày',
      };
    case '1month':
    case '30d':
      return {
        compare: 'so với tháng trước',
        growth: 'Tăng trưởng tháng',
      };
    case '90d':
      return {
        compare: 'so với 3 tháng trước',
        growth: 'Tăng trưởng quý',
      };
    case '6m':
      return {
        compare: 'so với 6 tháng trước',
        growth: 'Tăng trưởng 6 tháng',
      };
    case '1year':
    case '1y':
      return {
        compare: 'so với năm trước',
        growth: 'Tăng trưởng năm',
      };
    default:
      return {
        compare: 'so với kỳ trước',
        growth: 'Tốc độ tăng trưởng',
      };
  }
}

export function AccountStats({ stats, timeRange, isLoading = false }: AccountStatsProps) {
  const labels = getPeriodLabel(timeRange);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border-border/80 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
              <Skeleton className="size-12 rounded-xl shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isPositiveGrowth = stats.growthRate > 0;
  const isNegativeGrowth = stats.growthRate < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Thẻ 1: Tài khoản đăng ký mới */}
      <Card className="bg-card border-border/80 shadow-md relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        {/* Subtle decorative top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/50 to-indigo-500/50" />
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1.5 flex-1 min-w-0 pr-4">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">
              Đăng ký mới
            </span>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {stats.newThisMonth.toLocaleString('vi-VN')}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {isPositiveGrowth ? (
                <>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="h-3 w-3 shrink-0" />+{stats.growthRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium truncate">
                    {labels.compare}
                  </span>
                </>
              ) : isNegativeGrowth ? (
                <>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/25">
                    <TrendingDown className="h-3 w-3 shrink-0" />
                    {stats.growthRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium truncate">
                    {labels.compare}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground italic font-medium">
                  Không đổi {labels.compare}
                </span>
              )}
            </div>
          </div>
          <div className="size-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/10">
            <Users className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* Thẻ 2: Tốc độ tăng trưởng */}
      <Card className="bg-card border-border/80 shadow-md relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50" />
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1.5 flex-1 min-w-0 pr-4">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">
              Tốc độ tăng trưởng
            </span>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {stats.growthRate > 0 ? '+' : ''}
              {stats.growthRate.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {isPositiveGrowth ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  {labels.growth}
                </span>
              ) : isNegativeGrowth ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/25">
                  <TrendingDown className="h-3 w-3 shrink-0" />
                  {labels.growth}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground italic font-medium">
                  Không đổi {labels.compare}
                </span>
              )}
            </div>
          </div>
          <div
            className={`size-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isNegativeGrowth
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-rose-500/10'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-purple-500/10'
            }`}
          >
            {isNegativeGrowth ? (
              <TrendingDown className="size-5" />
            ) : (
              <TrendingUp className="size-5" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thẻ 3: Người dùng đồng hành (tỉ lệ active) */}
      <Card className="bg-card border-border/80 shadow-md relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 to-teal-500/50" />
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1.5 flex-1 min-w-0 pr-4">
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider block">
              Tỉ lệ hoạt động
            </span>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">
              {stats.activeRatio.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground font-medium truncate pt-1">
              {stats.activeCount} / {stats.total} tài khoản đang hoạt động
            </p>
          </div>
          <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs shadow-emerald-500/10">
            <UserCheck className="size-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
