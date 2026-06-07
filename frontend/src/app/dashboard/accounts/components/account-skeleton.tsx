'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AccountSkeleton() {
  const rows = Array.from({ length: 5 });

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Desktop Skeleton Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Thành viên</th>
              <th className="px-6 py-4">Liên hệ</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Hoạt động cuối</th>
              <th className="px-6 py-4">Ngày tham gia</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((_, index) => (
              <tr key={index} className="transition-colors">
                {/* Column Avatar + Fullname + Username */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>

                {/* Column Email */}
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-40" />
                </td>

                {/* Column Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>

                {/* Column Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>

                {/* Column Last Login */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-28" />
                </td>

                {/* Column Created Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
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
              {/* Row 1: Avatar + Name + Badges */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
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
