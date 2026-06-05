'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function BranchesSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Desktop Skeleton Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Mã chi nhánh</th>
              <th className="px-6 py-4">Tên chi nhánh</th>
              <th className="px-6 py-4">Thành phố</th>
              <th className="px-6 py-4">Địa chỉ chi tiết</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4">Ngày cập nhật</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((_, index) => (
              <tr key={index} className="transition-colors">
                {/* Column Store ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-16" />
                </td>

                {/* Column Store Name */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-32" />
                </td>

                {/* Column City */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>

                {/* Column Address */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-48" />
                </td>

                {/* Column Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>

                {/* Column Updated Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-28" />
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
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Row 2: Details */}
              <div className="space-y-2.5 border-t border-border/60 pt-3">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3.5 w-36" />
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

export function BranchesMapSkeleton() {
  return (
    <Card className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col h-[600px] justify-between animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-md bg-blue-500/20" />
            <Skeleton className="h-4.5 w-32" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-24 rounded-lg" />
      </div>

      {/* Map outline skeleton */}
      <div className="flex-1 my-4 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-center relative overflow-hidden">
        {/* Skeletons simulating the long S-shape of Vietnam */}
        <div className="absolute top-[10%] left-[45%] space-y-2 flex flex-col items-center">
          <Skeleton className="h-6 w-16 rounded-full opacity-60" />
          <Skeleton className="h-4 w-12 rounded-full opacity-50" />
        </div>
        <div className="absolute top-[35%] left-[50%] flex flex-col items-center">
          <Skeleton className="h-24 w-4 rounded-full opacity-40 animate-pulse" />
        </div>
        <div className="absolute bottom-[20%] left-[42%] space-y-2 flex flex-col items-center">
          <Skeleton className="h-10 w-14 rounded-full opacity-50" />
          <Skeleton className="h-6 w-20 rounded-full opacity-60" />
        </div>
        
        {/* Zoom controls placeholder */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-slate-900/40 p-1.5 rounded-lg border border-white/5">
          <Skeleton className="h-7 w-7 rounded bg-slate-800" />
          <Skeleton className="h-7 w-7 rounded bg-slate-800" />
          <Skeleton className="h-7 w-7 rounded bg-slate-800" />
        </div>
        
        {/* Pulsing points representing map markers */}
        <div className="absolute top-[20%] left-[44%]">
          <div className="h-3.5 w-3.5 rounded-full bg-blue-500/30 animate-ping" />
        </div>
        <div className="absolute top-[45%] left-[52%]">
          <div className="h-3.5 w-3.5 rounded-full bg-indigo-500/30 animate-ping delay-300" />
        </div>
        <div className="absolute bottom-[28%] left-[45%]">
          <div className="h-3.5 w-3.5 rounded-full bg-purple-500/30 animate-ping delay-700" />
        </div>
      </div>

      {/* Footer info placeholder */}
      <div className="border-t border-border/50 pt-3">
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
  );
}

export function BranchesChartSkeleton() {
  return (
    <Card className="bg-card border border-border rounded-xl p-5 shadow-md flex flex-col h-[600px] animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-3">
        <Skeleton className="h-8 w-8 rounded-lg bg-indigo-500/10" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4.5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Donut Chart Skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 my-4">
        <div className="relative flex items-center justify-center h-[180px] w-[180px]">
          {/* Inner circle of donut */}
          <div className="absolute inset-0 m-auto h-[100px] w-[100px] rounded-full bg-card border-[12px] border-muted/20 flex flex-col items-center justify-center">
            <Skeleton className="h-5 w-8 rounded" />
            <Skeleton className="h-2.5 w-10 rounded mt-1.5" />
          </div>
          {/* Outer circle of donut */}
          <div className="h-full w-full rounded-full border-[12px] border-muted/5 animate-pulse" />
        </div>

        {/* Legend listing region elements */}
        <div className="w-full space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

