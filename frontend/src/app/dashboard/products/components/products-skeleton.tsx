'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function ProductsChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {/* Gender Pie Chart Skeleton */}
      <div className="space-y-3 flex flex-col items-center">
        <Skeleton className="h-4 w-28 rounded mx-auto" />
        <div className="size-[160px] rounded-full border-[16px] border-muted flex items-center justify-center relative">
          <div className="size-20 rounded-full bg-background" />
        </div>
      </div>

      {/* Age Chart Bar Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 mx-auto" />
        <div className="space-y-2.5 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton
                className="h-4 flex-1 rounded bg-muted/60"
                style={{ maxWidth: `${90 - i * 15}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Activity Chart Bar Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 mx-auto" />
        <div className="space-y-2.5 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton
                className="h-4 flex-1 rounded bg-muted/60"
                style={{ maxWidth: `${80 - i * 12}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lifestyle Chart Bar Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 mx-auto" />
        <div className="space-y-2.5 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton
                className="h-4 flex-1 rounded bg-muted/60"
                style={{ maxWidth: `${85 - i * 18}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductsFilterSkeleton() {
  return (
    <Card className="bg-card border-border shadow-md animate-pulse">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-1.5 border-b border-border pb-2">
          <Skeleton className="h-4 w-48 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Skeleton className="h-3 w-40 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductsTableSkeleton() {
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-4 w-[160px]">Mã sản phẩm</th>
              <th className="px-5 py-4 min-w-[280px]">Tên sản phẩm</th>
              <th className="px-5 py-4 w-[120px]">Giới tính</th>
              <th className="px-5 py-4 w-[130px]">Giá vốn</th>
              <th className="px-5 py-4 w-[130px]">Giá bán lẻ</th>
              <th className="px-5 py-4 min-w-[200px]">Độ tuổi / Hoạt động / Phong cách</th>
              <th className="px-5 py-4 text-right w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {skeletonRows.map((_, index) => (
              <tr key={index} className="h-16">
                {/* ID */}
                <td className="px-5 py-4">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                {/* Name */}
                <td className="px-5 py-4">
                  <Skeleton className="h-4 w-64 rounded" />
                </td>
                {/* Gender */}
                <td className="px-5 py-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                {/* Cost */}
                <td className="px-5 py-4">
                  <Skeleton className="h-4 w-20 rounded" />
                </td>
                {/* Price */}
                <td className="px-5 py-4">
                  <Skeleton className="h-4 w-24 rounded" />
                </td>
                {/* Tags */}
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-5 w-20 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                </td>
                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductsCardsSkeleton() {
  const skeletonCards = Array.from({ length: 4 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
      {skeletonCards.map((_, index) => (
        <Card key={index} className="bg-card border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-5 w-14 rounded" />
            </div>

            <div className="space-y-1">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm pt-1">
              <div>
                <Skeleton className="h-3 w-12 rounded mb-1" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 rounded mb-1" />
                <Skeleton className="h-6 w-10 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm border-t border-dashed border-border pt-2">
              <div>
                <Skeleton className="h-3 w-12 rounded mb-1" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div>
                <Skeleton className="h-3 w-16 rounded mb-1" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>

            <div className="bg-muted/30 p-2 rounded-lg flex gap-1.5">
              <Skeleton className="h-4 w-14 rounded bg-background/50" />
              <Skeleton className="h-4 w-16 rounded bg-background/50" />
              <Skeleton className="h-4 w-14 rounded bg-background/50" />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ProductsSkeleton() {
  return (
    <div className="space-y-4">
      <ProductsTableSkeleton />
      <ProductsCardsSkeleton />
    </div>
  );
}
