'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function InventoryReportsChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {/* Chart 1: Plant Inventory Skeleton */}
      <div className="flex flex-col border border-border/50 bg-background/20 rounded-xl p-4">
        <Skeleton className="h-4 w-40 rounded mb-4" />
        <div className="h-52 flex items-end gap-2.5 px-4 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-24 flex-1 rounded bg-muted/60"
              style={{ height: `${90 - i * 15}%` }}
            />
          ))}
        </div>
      </div>

      {/* Chart 2: Monthly/Timeline Inventory Skeleton */}
      <div className="flex flex-col border border-border/50 bg-background/20 rounded-xl p-4">
        <Skeleton className="h-4 w-44 rounded mb-4" />
        <div className="h-52 flex items-end relative px-4 pt-2">
          <div className="absolute inset-x-4 bottom-2 top-8 border-b border-muted flex items-end">
            <svg
              className="w-full h-full text-muted/30"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0 80 Q 25 50, 50 70 T 100 30 L 100 100 L 0 100 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InventoryReportsFilterSkeleton() {
  return (
    <Card className="border border-border/80 bg-card/40 backdrop-blur-xs animate-pulse">
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function InventoryReportsTableSkeleton({ isAdmin }: { isAdmin: boolean }) {
  const skeletonRows = Array.from({ length: 6 });

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden animate-pulse">
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
            {skeletonRows.map((_, index) => (
              <tr key={index} className="h-14">
                <td className="px-5 py-3.5">
                  <Skeleton className="h-4 w-24 rounded" />
                </td>
                <td className="px-5 py-3.5">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                <td className="px-5 py-3.5">
                  <Skeleton className="h-4 w-16 rounded" />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                {isAdmin && (
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface InventoryReportsSkeletonProps {
  isAdmin: boolean;
}

export function InventoryReportsSkeleton({ isAdmin }: InventoryReportsSkeletonProps) {
  return (
    <div className="space-y-4">
      <InventoryReportsTableSkeleton isAdmin={isAdmin} />
    </div>
  );
}
