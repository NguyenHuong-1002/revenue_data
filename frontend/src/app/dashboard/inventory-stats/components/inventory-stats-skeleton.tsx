'use client';

import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';

export function InventoryStatsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4 w-full max-w-xl">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-6 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 p-1 w-fit flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col gap-2"
            >
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-7 w-36 rounded-md" />
              <Skeleton className="h-3 w-44 rounded-md mt-1" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col gap-4">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col gap-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
