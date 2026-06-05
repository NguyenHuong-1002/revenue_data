'use client';

// ===== Component hiển thị 3 thẻ thống kê tổng quan =====
// Gồm: Tổng tài khoản, Tốc độ tăng trưởng, Người dùng đồng hành

import { Users, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
}

function getPeriodLabel(timeRange: string) {
  switch (timeRange) {
    case '7d':
      return {
        compare: 'so với 7 ngày trước',
        growth: '7d Growth',
      };
    case '1month':
    case '30d':
      return {
        compare: 'so với tháng trước',
        growth: 'MoM Growth',
      };
    case '90d':
      return {
        compare: 'so với 3 tháng trước',
        growth: 'Quarterly Growth',
      };
    case '6m':
      return {
        compare: 'so với 6 tháng trước',
        growth: '6m Growth',
      };
    case '1year':
    case '1y':
      return {
        compare: 'so với năm trước',
        growth: 'YoY Growth',
      };
    default:
      return {
        compare: 'so với kỳ trước',
        growth: 'Growth',
      };
  }
}

export function AccountStats({ stats, timeRange }: AccountStatsProps) {
  const labels = getPeriodLabel(timeRange);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Thẻ 1: Tài khoản đăng ký mới */}
      <Card className="bg-card border-border shadow-md relative overflow-hidden group hover:border-border/80 transition-all">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">Tài khoản đăng ký mới</span>
            <p className="text-3xl font-bold text-foreground">{stats.newThisMonth}</p>
            <div className="flex items-center gap-1 mt-2">
              {stats.growthRate > 0 ? (
                <>
                  {/* Tăng trưởng dương — màu xanh lá */}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="h-3 w-3" />+{stats.growthRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">{labels.compare}</span>
                </>
              ) : stats.growthRate < 0 ? (
                <>
                  {/* Tăng trưởng âm — màu đỏ */}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/25">
                    <TrendingDown className="h-3 w-3" />
                    {stats.growthRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">{labels.compare}</span>
                </>
              ) : (
                /* Không đổi */
                <span className="text-[10px] text-muted-foreground italic">
                  Không đổi {labels.compare}
                </span>
              )}
            </div>
          </div>
          <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Users className="size-6" />
          </div>
        </CardContent>
      </Card>

      {/* Thẻ 2: Tốc độ tăng trưởng */}
      <Card className="bg-card border-border shadow-md relative overflow-hidden group hover:border-border/80 transition-all">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">Tốc độ tăng trưởng</span>
            <p className="text-3xl font-bold text-foreground">
              {stats.growthRate > 0 ? '+' : ''}
              {stats.growthRate.toFixed(1)}%
            </p>
            <div className="flex items-center gap-1 mt-2">
              {stats.growthRate > 0 ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3" />
                  {labels.growth}
                </span>
              ) : stats.growthRate < 0 ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/25">
                  <TrendingDown className="h-3 w-3" />
                  {labels.growth}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">
                  Không đổi {labels.compare}
                </span>
              )}
            </div>
          </div>
          <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <TrendingUp className="size-6" />
          </div>
        </CardContent>
      </Card>

      {/* Thẻ 3: Người dùng đồng hành (tỉ lệ active) */}
      <Card className="bg-card border-border shadow-md relative overflow-hidden group hover:border-border/80 transition-all">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">Người dùng đồng hành</span>
            <p className="text-3xl font-bold text-foreground">{stats.activeRatio.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground mt-2">
              {stats.activeCount} / {stats.total} tài khoản đang hoạt động
            </p>
          </div>
          <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <UserCheck className="size-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
