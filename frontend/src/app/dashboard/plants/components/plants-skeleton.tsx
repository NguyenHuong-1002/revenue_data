'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function PlantsSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Desktop Skeleton Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Mã nhà kho</th>
              <th className="px-6 py-4">Tên nhà kho</th>
              <th className="px-6 py-4">Địa chỉ</th>
              <th className="px-6 py-4">Người quản lý</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((_, index) => (
              <tr key={index} className="transition-colors">
                {/* Column Plant ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-16" />
                </td>

                {/* Column Plant Name */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-32" />
                </td>

                {/* Column Address */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-48" />
                </td>

                {/* Column Manager */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-28" />
                </td>

                {/* Column Phone */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>

                {/* Column Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-20" />
                </td>

                {/* Column Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {rows.slice(0, 3).map((_, index) => (
          <Card key={index} className="bg-card border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              {/* Row 1: Header */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Row 2: Details */}
              <div className="space-y-2.5 border-t border-border/60 pt-3">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-40" />
              </div>

              {/* Row 3: Buttons */}
              <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function PlantsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl bg-blue-500/10" />
        </CardContent>
      </Card>
    </div>
  );
}

export function PlantsChartSkeleton() {
  return (
    <Card className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col h-full min-h-[300px] animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
        <Skeleton className="h-8 w-8 rounded-lg bg-indigo-500/10" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4.5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Donut Chart Skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 my-2">
        <div className="relative flex items-center justify-center h-[140px] w-[140px]">
          {/* Inner circle of donut */}
          <div className="absolute inset-0 m-auto h-[80px] w-[80px] rounded-full bg-card border-[10px] border-muted/20 flex flex-col items-center justify-center">
            <Skeleton className="h-4 w-6 rounded" />
            <Skeleton className="h-2.5 w-10 rounded mt-1" />
          </div>
          {/* Outer circle of donut */}
          <div className="h-full w-full rounded-full border-[10px] border-muted/5 animate-pulse" />
        </div>

        {/* Legend listing region elements */}
        <div className="w-full space-y-2.5 mt-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-3.5 w-8" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

