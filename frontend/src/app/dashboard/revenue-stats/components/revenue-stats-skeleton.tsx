'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/* ────────────────────────────────────────────────────────────
   KPI Cards skeleton  (4 cards in a grid)
──────────────────────────────────────────────────────────── */
function KpiCardSkeleton() {
  return (
    <Card className="border border-border/80 bg-card/30 backdrop-blur-xs relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
   Chart area skeleton
──────────────────────────────────────────────────────────── */
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`border border-border/80 bg-card/35 backdrop-blur-xs ${className ?? ''}`}>
      <CardHeader className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-3 w-64" />
      </CardHeader>
      <CardContent className="p-4">
        {/* Y-axis tick stubs + bars/area */}
        <div className="h-[280px] w-full flex flex-col justify-end gap-3 relative">
          {/* Horizontal grid lines */}
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="absolute w-full h-px opacity-40"
              style={{ bottom: `${i * 24}%` }}
            />
          ))}
          {/* Bar-like columns */}
          <div className="flex items-end gap-2 h-full px-4 pb-4">
            {[65, 80, 45, 90, 55, 70, 40, 85, 60, 75].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
   Product rankings skeleton
──────────────────────────────────────────────────────────── */
function ProductRankingsSkeleton() {
  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-3 w-72" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Tab pills */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-border/50">
          {[120, 96, 110, 100, 130, 115].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-lg" style={{ width: w }} />
          ))}
        </div>
        {/* Row items */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-3.5 bg-muted/20 border border-border/50 rounded-xl"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Skeleton className="size-6 rounded-full shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
              <div className="text-right space-y-1 shrink-0">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-2.5 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
   Branch breakdown skeleton
──────────────────────────────────────────────────────────── */
function BranchBreakdownSkeleton() {
  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-3 w-60" />
      </CardHeader>
      <CardContent className="pt-4 px-5 space-y-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton
              className="h-2 w-full rounded-full"
              style={{ width: `${Math.max(30, 100 - i * 15)}%` }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
   Top products skeleton
──────────────────────────────────────────────────────────── */
function TopProductsSkeleton() {
  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent className="pt-4 px-5 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20"
          >
            <Skeleton className="size-5 rounded-full shrink-0" />
            <div className="flex-1 space-y-1 min-w-0">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <div className="text-right space-y-1 shrink-0">
              <Skeleton className="h-3 w-20 ml-auto" />
              <Skeleton className="h-2.5 w-14 ml-auto" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ────────────────────────────────────────────────────────────
   Header skeleton
──────────────────────────────────────────────────────────── */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-[180px] rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Full page skeleton  (public export)
──────────────────────────────────────────────────────────── */
export function RevenueStatsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Header */}
      <HeaderSkeleton />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartSkeleton className="lg:col-span-2" />
        <ChartSkeleton />
      </div>

      {/* Product Rankings */}
      <ProductRankingsSkeleton />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchBreakdownSkeleton />
        <TopProductsSkeleton />
      </div>
    </div>
  );
}
