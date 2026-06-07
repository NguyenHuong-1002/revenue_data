'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSign,
  Package,
  Bell,
  ShoppingCart,
  Loader2,
  Minus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { saleReportService } from '@/lib/services/sale-report.service';
import { inventoryReportService } from '@/lib/services/inventory-report.service';
import { notificationService } from '@/lib/services/notification.service';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function getDateRange(range?: string) {
  if (!range) return { fromDate: undefined, toDate: undefined };
  const now = new Date();
  const toDate = now.toISOString().split('T')[0];
  const from = new Date(now);
  if (range === '7d') from.setDate(now.getDate() - 7);
  else if (range === '1m') from.setMonth(now.getMonth() - 1);
  else if (range === '3m') from.setMonth(now.getMonth() - 3);
  else if (range === '6m') from.setMonth(now.getMonth() - 6);
  else if (range === '1y') from.setFullYear(now.getFullYear() - 1);
  return { fromDate: from.toISOString().split('T')[0], toDate };
}

function fmtNum(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function SectionCards({ timeRange }: { timeRange?: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    growthRate: 0,
    unreadNotifications: 0,
  });
  const [kpis, setKpis] = useState<{
    totalStock: number;
    growthPercent: number | null;
    totalProducts: number;
    totalPlants: number;
  } | null>(null);
  const [inventoryGrowth, setInventoryGrowth] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { fromDate, toDate } = getDateRange(timeRange);
        const dateParams = fromDate && toDate ? { fromDate, toDate } : undefined;

        const [revRes, notificationsRes, kpisRes, rankingsRes] = await Promise.all([
          saleReportService
            .getRevenueStats(timeRange)
            .catch(() => ({ data: { totalRevenue: 0, growthRate: 0 } })),
          notificationService.getAll(1, 100).catch(() => ({ data: { data: [] } })),
          inventoryReportService.getKpis(dateParams).catch(() => ({ data: null })),
          inventoryReportService.getRankings(12, dateParams).catch(() => ({ data: null })),
        ]);

        const unreadCount = (notificationsRes.data?.data || []).filter(
          (n: any) => !n.read_at
        ).length;

        setStats({
          totalRevenue: revRes.data?.totalRevenue ?? 0,
          growthRate: revRes.data?.growthRate ?? 0,
          unreadNotifications: unreadCount,
        });

        if (kpisRes.data) {
          setKpis(kpisRes.data as typeof kpis);
        }

        // Tính tăng trưởng tồn kho từ monthlyTrend
        const trend = (rankingsRes.data as any)?.monthlyTrend ?? [];
        if (trend.length >= 2) {
          const first = trend[0].total as number;
          const last = trend[trend.length - 1].total as number;
          setInventoryGrowth(first === 0 ? null : Math.round(((last - first) / first) * 1000) / 10);
        } else {
          setInventoryGrowth((kpisRes.data as any)?.growthPercent ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard card stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="p-6 flex flex-col justify-between h-32 border border-border/80 bg-card shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-7 w-40 rounded-md" />
            </div>
            <Skeleton className="h-3 w-48 rounded-md mt-1" />
          </Card>
        ))}
      </div>
    );
  }

  const invGrowthPositive = (inventoryGrowth ?? 0) > 0;
  const invGrowthNeutral = inventoryGrowth === null || inventoryGrowth === 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Thẻ 1: Tổng doanh thu */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Tổng doanh thu</CardDescription>
          <CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-2xl">
            {fmtNum(stats.totalRevenue)} đ
          </CardTitle>
          <CardAction>
            {stats.growthRate !== 0 && (
              <Badge
                variant="outline"
                className={cn(
                  'gap-1',
                  stats.growthRate > 0
                    ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                )}
              >
                {stats.growthRate > 0 ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                {stats.growthRate > 0 ? '+' : ''}
                {stats.growthRate}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex gap-1.5 font-medium text-muted-foreground">
            {stats.growthRate > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                Đang tăng trưởng <TrendingUpIcon className="size-3.5" />
              </span>
            ) : stats.growthRate < 0 ? (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                Suy giảm doanh số <TrendingDownIcon className="size-3.5" />
              </span>
            ) : (
              <span>Duy trì ổn định</span>
            )}
          </div>
          <div className="text-muted-foreground/75">Dựa trên báo cáo doanh số thực tế</div>
        </CardFooter>
      </Card>

      {/* Thẻ 2: Tổng tồn kho */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Tổng tồn kho</CardDescription>
          <CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-2xl">
            {kpis ? fmtNum(kpis.totalStock) : '—'} sp
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg border border-indigo-500/20">
              <Package className="size-3.5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="font-medium text-foreground/80">Hàng đang lưu trữ tại kho</div>
          <div className="text-muted-foreground/75">
            Tổng hợp từ {kpis?.totalPlants ?? '—'} nhà máy sản xuất
          </div>
        </CardFooter>
      </Card>

      {/* Thẻ 3: Tăng trưởng tồn kho */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Tăng trưởng tồn kho</CardDescription>
          <CardTitle
            className={cn(
              'text-xl font-bold tabular-nums @[250px]/card:text-2xl',
              invGrowthPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : invGrowthNeutral
                  ? 'text-foreground'
                  : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {invGrowthNeutral ? '—' : `${invGrowthPositive ? '+' : ''}${inventoryGrowth}%`}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                'gap-1',
                invGrowthPositive
                  ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                  : invGrowthNeutral
                    ? 'text-muted-foreground bg-muted border-border'
                    : 'text-rose-600 bg-rose-500/10 border-rose-500/20'
              )}
            >
              {invGrowthPositive ? (
                <TrendingUpIcon className="size-3" />
              ) : invGrowthNeutral ? (
                <Minus className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {invGrowthNeutral ? 'Ổn định' : invGrowthPositive ? 'Tăng' : 'Giảm'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="font-medium text-foreground/80">So với đầu kỳ đã chọn</div>
          <div className="text-muted-foreground/75">Tính từ xu hướng tồn kho theo tháng</div>
        </CardFooter>
      </Card>

      {/* Thẻ 4: Loại sản phẩm */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Loại sản phẩm trong kho</CardDescription>
          <CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-2xl">
            {kpis ? fmtNum(kpis.totalProducts) : '—'} loại
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-violet-500/10 text-violet-500 rounded-lg border border-violet-500/20">
              <ShoppingCart className="size-3.5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="font-medium text-foreground/80">SKU đang có hàng trong kỳ</div>
          <div className="text-muted-foreground/75">Đa dạng kích cỡ, màu sắc, giới tính</div>
        </CardFooter>
      </Card>
    </div>
  );
}
