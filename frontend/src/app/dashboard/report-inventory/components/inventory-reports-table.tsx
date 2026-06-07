'use client';

import { Copy, Check, Edit, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IInventoryReport } from '@/lib/services/inventory-report.service';
import { Skeleton } from '@/components/ui/skeleton';

interface InventoryReportsTableProps {
  reports: IInventoryReport[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (report: IInventoryReport) => void;
  onDelete: (id: string) => void;
  copiedId: string | null;
  onCopyId: (id: string) => void;
}

export function InventoryReportsTable({
  reports,
  isLoading,
  isAdmin,
  onEdit,
  onDelete,
  copiedId,
  onCopyId,
}: InventoryReportsTableProps) {
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-4">Mã Tồn Kho (ID)</th>
              <th className="px-5 py-4">Sản Phẩm (Product)</th>
              <th className="px-5 py-4">Nhà Máy (Plant)</th>
              <th className="px-5 py-4 text-right">Số Lượng Tồn</th>
              <th className="px-5 py-4">Thời Gian Tuần</th>
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
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Skeleton className="h-4 w-12 rounded-md ml-auto" />
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
                <td colSpan={isAdmin ? 6 : 5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShieldAlert className="h-10 w-10 text-orange-500 opacity-60" />
                    <span className="font-semibold text-foreground">
                      Không tìm thấy báo cáo tồn kho nào
                    </span>
                    <span className="text-xs max-w-sm">
                      Thử điều chỉnh lại bộ lọc hoặc khoảng thời gian tìm kiếm để hiển thị dữ liệu.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.inventory_id} className="hover:bg-muted/15 transition-colors">
                  {/* ID Báo cáo */}
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span>{report.inventory_id}</span>
                      <button
                        onClick={() => onCopyId(report.inventory_id)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-sm cursor-pointer"
                      >
                        {copiedId === report.inventory_id ? (
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

                  {/* Nhà máy */}
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                    {report.plant_id}
                  </td>

                  {/* Số lượng */}
                  <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                    {new Intl.NumberFormat().format(report.quantity)}
                  </td>

                  {/* Thời gian */}
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">
                    {report.calendar_year_week ? report.calendar_year_week.slice(0, 10) : '-'}
                  </td>

                  {/* Hành động (Chỉ ADMIN) */}
                  {isAdmin && (
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(report)}
                          className="size-8 cursor-pointer text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/30"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(report.inventory_id)}
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
