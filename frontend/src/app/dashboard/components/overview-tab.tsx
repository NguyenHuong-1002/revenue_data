'use client';

import * as React from 'react';
import { SectionCards } from '@/components/section-cards';
import { QuickActions } from './quick-actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  recentSales: any[];
  lowStockAlerts: any[];
  productMap: Record<string, string>;
  branchMap: Record<string, string>;
  plantMap: Record<string, string>;
  setActiveTab: (tab: 'overview' | 'analytics' | 'operations') => void;
  timeRange: string;
}

export function OverviewTab({
  recentSales,
  lowStockAlerts,
  productMap,
  branchMap,
  plantMap,
  setActiveTab,
  timeRange,
}: OverviewTabProps) {
  const rangeLabel: Record<string, string> = {
    '7d': '7 ngày qua',
    '1m': '1 tháng qua',
    '3m': '3 tháng qua',
    '6m': '6 tháng qua',
    '1y': '1 năm qua',
  };
  const periodText = rangeLabel[timeRange] ?? timeRange;
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Bảng KPIs */}
      <SectionCards timeRange={timeRange} />

      {/* Phím tắt thao tác nhanh */}
      <QuickActions />

      {/* Hoạt động cần chú ý (Mini version of tables) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Giao dịch doanh số mới nhất */}
        <Card className="border-border/50 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2.5 border-b border-border/30 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-indigo-500" />
                Giao dịch doanh số mới nhất
              </CardTitle>
              <CardDescription className="text-[11px] mt-0.5">
                {recentSales.length} giao dịch trong {periodText}
              </CardDescription>
            </div>
            <button
              onClick={() => setActiveTab('operations')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Xem chi tiết <ChevronRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20 text-xs font-medium">
              {recentSales.length > 0 ? (
                recentSales.slice(0, 4).map((sale) => (
                  <div
                    key={sale.sale_id}
                    className="flex items-center justify-between p-3 hover:bg-muted/5 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span
                        className="font-semibold text-foreground truncate"
                        title={productMap[sale.product_id] || sale.product_id}
                      >
                        {productMap[sale.product_id] || sale.product_id}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {branchMap[sale.branch_id] || sale.branch_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[8px] font-bold px-1.5 py-0 border-none rounded-md',
                          sale.distribution_channel === 'Online' && 'bg-blue-500/10 text-blue-500',
                          sale.distribution_channel === 'Bán lẻ' &&
                            'bg-emerald-500/10 text-emerald-500',
                          sale.distribution_channel === 'Bán sỉ' &&
                            'bg-purple-500/10 text-purple-500',
                          !['Online', 'Bán lẻ', 'Bán sỉ'].includes(sale.distribution_channel) &&
                            'bg-amber-500/10 text-amber-500'
                        )}
                      >
                        {sale.distribution_channel}
                      </Badge>
                      <span
                        className={cn(
                          'font-bold tabular-nums text-right w-12',
                          sale.sold_quantity < 0 && 'text-rose-500'
                        )}
                      >
                        {sale.sold_quantity > 0 ? `+${sale.sold_quantity}` : sale.sold_quantity}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground text-xs">
                  Không có dữ liệu giao dịch gần đây.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cảnh báo tồn kho thấp */}
        <Card className="border-border/50 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2.5 border-b border-border/30 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Cảnh báo tồn kho cực thấp
              </CardTitle>
              <CardDescription className="text-[11px] mt-0.5">
                {lowStockAlerts.length} mặt hàng dưới ngưỡng trong {periodText}
              </CardDescription>
            </div>
            <a
              href="/dashboard/inventory-stats"
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Xem phân tích kho <ChevronRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20 text-xs font-medium">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.slice(0, 4).map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 hover:bg-rose-500/5 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <span
                        className="font-semibold text-foreground truncate"
                        title={productMap[alert.product_id] || alert.product_id}
                      >
                        {productMap[alert.product_id] || alert.product_id}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {plantMap[alert.plant_id] || alert.plant_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        Còn {alert.quantity} sp
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground text-xs">
                  Không có cảnh báo tồn kho cực thấp.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
