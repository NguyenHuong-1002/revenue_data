'use client';

import * as React from 'react';
import { Loader2, ShieldAlert, Check, Copy, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ISaleReport } from '@/lib/services/sale-report.service';
import { Skeleton } from '@/components/ui/skeleton';

interface SaleReportsTableProps {
  reports: ISaleReport[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (report: ISaleReport) => void;
  onDelete: (id: string) => void;
  copiedId: string | null;
  onCopyId: (id: string) => void;
}

export function SaleReportsTable({
  reports,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
  copiedId,
  onCopyId,
}: SaleReportsTableProps) {
  // Channel badge configuration
  const getChannelBadge = (channel: string) => {
    const channelStyles: Record<string, string> = {
      Online: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Bán lẻ': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'Phát sinh': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
      'Bán sỉ': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Siêu thị': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Hợp đồng': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Chi nhánh': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    return (
      <Badge
        variant="outline"
        className={`${channelStyles[channel] || 'bg-muted text-muted-foreground border-border'} px-2 py-0.5 font-medium`}
      >
        {channel}
      </Badge>
    );
  };

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-4">Mã Báo Cáo (ID)</th>
              <th className="px-5 py-4">Sản Phẩm (Product)</th>
              <th className="px-5 py-4 text-right">Số Lượng Bán</th>
              <th className="px-5 py-4 text-center">Kênh Phân Phối</th>
              <th className="px-5 py-4">Chi Nhánh</th>
              <th className="px-5 py-4">Thời Gian</th>
              {isAdmin && <th className="px-5 py-4 text-center">Hành Động</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Skeleton className="h-4 w-12 rounded-md ml-auto" />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Skeleton className="h-5 w-16 rounded-full mx-auto" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShieldAlert className="h-10 w-10 text-orange-500 opacity-60" />
                    <span className="font-semibold text-foreground">
                      Không tìm thấy báo cáo doanh số nào
                    </span>
                    <span className="text-xs max-w-sm">
                      Thử điều chỉnh lại bộ lọc hoặc khoảng thời gian tìm kiếm để hiển thị dữ liệu.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.sale_id} className="hover:bg-muted/15 transition-colors">
                  {/* ID Báo cáo */}
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span>{report.sale_id}</span>
                      <button
                        onClick={() => onCopyId(report.sale_id)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-sm cursor-pointer"
                      >
                        {copiedId === report.sale_id ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Sản phẩm */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-foreground/80">
                      <span>{report.product_id}</span>
                      <button
                        onClick={() => onCopyId(report.product_id)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-sm cursor-pointer"
                      >
                        {copiedId === report.product_id ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Số lượng */}
                  <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                    {new Intl.NumberFormat().format(report.sold_quantity)}
                  </td>

                  {/* Kênh phân phối */}
                  <td className="px-5 py-3.5 text-center">
                    {getChannelBadge(report.distribution_channel)}
                  </td>

                  {/* Chi nhánh */}
                  <td className="px-5 py-3.5 text-muted-foreground font-medium text-xs">
                    {report.branch_id}
                  </td>

                  {/* Thời gian */}
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">
                    {report.time_report.slice(0, 10)}
                  </td>

                  {/* Hành động (Chỉ ADMIN) */}
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(report)}
                          className="size-8 cursor-pointer text-muted-foreground hover:text-blue-500 hover:border-blue-500/30"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(report.sale_id)}
                          className="size-8 cursor-pointer text-muted-foreground hover:text-destructive hover:border-destructive/30"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
