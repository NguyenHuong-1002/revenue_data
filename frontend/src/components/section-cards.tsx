'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { TrendingUpIcon, TrendingDownIcon, DollarSign, Package, Bell, ShoppingCart, Loader2 } from 'lucide-react';
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
import { productService } from '@/lib/services/product.service';
import { notificationService } from '@/lib/services/notification.service';
import { cn } from '@/lib/utils';

export function SectionCards() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    growthRate: 0,
    totalSales: 0,
    totalProducts: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [revRes, salesRes, productsRes, notificationsRes] = await Promise.all([
          saleReportService.getRevenueStats().catch(() => ({ data: { totalRevenue: 0, growthRate: 0 } })),
          saleReportService.list({ limit: 1 }).catch(() => ({ data: { meta: { total: 0 } } })),
          productService.list({ limit: 1 }).catch(() => ({ data: { meta: { total: 0 } } })),
          notificationService.getAll(1, 100).catch(() => ({ data: { data: [] } })),
        ]);

        const unreadCount = (notificationsRes.data?.data || []).filter((n: any) => !n.read_at).length;

        setStats({
          totalRevenue: revRes.data?.totalRevenue ?? 0,
          growthRate: revRes.data?.growthRate ?? 0,
          totalSales: salesRes.data?.meta?.total ?? 0,
          totalProducts: productsRes.data?.meta?.total ?? 0,
          unreadNotifications: unreadCount,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard card stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex h-32 items-center justify-center bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Thẻ 1: Tổng doanh thu */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Tổng doanh thu</CardDescription>
          <CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-2xl">
            {new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)} đ
          </CardTitle>
          <CardAction>
            {stats.growthRate !== 0 && (
              <Badge variant="outline" className={cn(
                "gap-1",
                stats.growthRate > 0 
                  ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" 
                  : "text-rose-600 bg-rose-500/10 border-rose-500/20"
              )}>
                {stats.growthRate > 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                {stats.growthRate > 0 ? "+" : ""}{stats.growthRate}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="flex gap-1.5 font-medium text-muted-foreground">
            {stats.growthRate > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                Đang tăng trưởng tháng này <TrendingUpIcon className="size-3.5" />
              </span>
            ) : stats.growthRate < 0 ? (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                Suy giảm doanh số tháng này <TrendingDownIcon className="size-3.5" />
              </span>
            ) : (
              <span>Duy trì ổn định</span>
            )}
          </div>
          <div className="text-muted-foreground/75">Dựa trên báo cáo doanh số thực tế</div>
        </CardFooter>
      </Card>

      {/* Thẻ 2: Báo cáo doanh số */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Báo cáo doanh số (Sale)</CardDescription>
          <CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-2xl">
            {stats.totalSales} bản ghi
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">
              <ShoppingCart className="size-3.5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="font-medium text-foreground/80">Quản lý bán lẻ & phân phối</div>
          <div className="text-muted-foreground/75">Đồng bộ trên toàn bộ chi nhánh</div>
        </CardFooter>
      </Card>

      {/* Thẻ 3: Quản lý sản phẩm */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Danh mục sản phẩm</CardDescription>
          <CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-2xl">
            {stats.totalProducts} sản phẩm
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg border border-purple-500/20">
              <Package className="size-3.5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="font-medium text-foreground/80">Đầy đủ các nhóm ngành hàng</div>
          <div className="text-muted-foreground/75">Quản lý kích cỡ, màu sắc, giá bán</div>
        </CardFooter>
      </Card>

      {/* Thẻ 4: Thông báo chưa đọc */}
      <Card className="@container/card border-border/80">
        <CardHeader>
          <CardDescription>Thông báo hệ thống</CardDescription>
          <CardTitle className="text-xl font-bold tabular-nums @[250px]/card:text-2xl">
            {stats.unreadNotifications} mới
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <Bell className="size-3.5" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs">
          <div className="font-medium text-foreground/80">Thông báo tồn kho & đơn hàng</div>
          <div className="text-muted-foreground/75">Yêu cầu phản hồi từ hệ thống</div>
        </CardFooter>
      </Card>
    </div>
  );
}
