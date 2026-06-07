'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ShoppingBag, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OperationsTabProps {
  recentSales: any[];
  lowStockAlerts: any[];
  productMap: Record<string, string>;
  branchMap: Record<string, string>;
  plantMap: Record<string, string>;
  formatDate: (dateStr: string) => string;
}

export function OperationsTab({
  recentSales,
  lowStockAlerts,
  productMap,
  branchMap,
  plantMap,
  formatDate,
}: OperationsTabProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Bảng 1: Báo cáo doanh số gần đây */}
      <Card className="border-border/50 shadow-sm flex flex-col justify-between">
        <CardHeader className="pb-2 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-indigo-500" />
                Bản ghi doanh số bán hàng gần đây (Chi tiết)
              </CardTitle>
              <CardDescription>
                Danh sách đầy đủ các bản ghi doanh số mới được cập nhật trên hệ thống
              </CardDescription>
            </div>
            <Link
              href="/dashboard/report-sale"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              Xem trang báo cáo <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/20 text-muted-foreground uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Mã GD</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Chi nhánh</th>
                  <th className="px-4 py-3 text-right">Số lượng</th>
                  <th className="px-4 py-3 text-center">Kênh</th>
                  <th className="px-4 py-3 text-right">Ngày báo cáo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium text-slate-700 dark:text-slate-200">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <tr key={sale.sale_id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[10px] text-muted-foreground">
                        {sale.sale_id.slice(0, 8)}...
                      </td>
                      <td
                        className="px-4 py-3 font-semibold truncate max-w-[160px]"
                        title={productMap[sale.product_id] || sale.product_id}
                      >
                        {productMap[sale.product_id] || sale.product_id}
                      </td>
                      <td
                        className="px-4 py-3 truncate max-w-[140px]"
                        title={branchMap[sale.branch_id] || sale.branch_id}
                      >
                        {branchMap[sale.branch_id] || sale.branch_id}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        {sale.sold_quantity > 0 ? (
                          <span className="text-foreground">{sale.sold_quantity}</span>
                        ) : (
                          <span className="text-rose-500 font-semibold">
                            {sale.sold_quantity} (Trả)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0 border-none rounded-md',
                            sale.distribution_channel === 'Online' &&
                              'bg-blue-500/10 text-blue-500',
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
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatDate(sale.time_report)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      Không có dữ liệu giao dịch gần đây.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bảng 2: Cảnh báo tồn kho cực thấp */}
      <Card className="border-border/50 shadow-sm flex flex-col justify-between">
        <CardHeader className="pb-2 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
                Cảnh báo tồn kho cực thấp (Dưới 50)
              </CardTitle>
              <CardDescription>
                Sản phẩm tại các nhà máy có lượng dự trữ chạm mức báo động
              </CardDescription>
            </div>
            <a
              href="/dashboard/inventory-stats"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
            >
              Phân tích kho AI <ChevronRight className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border/20 text-muted-foreground uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Nhà máy / Kho</th>
                  <th className="px-4 py-3 text-right">Số lượng tồn</th>
                  <th className="px-4 py-3">Mức độ an toàn</th>
                  <th className="px-4 py-3 text-right">Cập nhật lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium text-slate-700 dark:text-slate-200">
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((alert, i) => (
                    <tr key={i} className="hover:bg-rose-500/5 transition-colors">
                      <td
                        className="px-4 py-3 font-semibold truncate max-w-[180px]"
                        title={productMap[alert.product_id] || alert.product_id}
                      >
                        {productMap[alert.product_id] || alert.product_id}
                      </td>
                      <td
                        className="px-4 py-3 truncate max-w-[150px]"
                        title={plantMap[alert.plant_id] || alert.plant_id}
                      >
                        {plantMap[alert.plant_id] || alert.plant_id}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        {alert.quantity} sp
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-muted/60 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: `${Math.min(100, (alert.quantity / 50) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-rose-500 font-bold">
                            {((alert.quantity / 50) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatDate(alert.last_date)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      Không có sản phẩm nào chạm ngưỡng cảnh báo tồn kho thấp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
