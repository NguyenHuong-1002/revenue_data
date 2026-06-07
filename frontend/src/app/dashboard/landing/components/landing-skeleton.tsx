'use client';

import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';

export function LandingSkeleton() {
  return (
    <div className="space-y-6 mt-0">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
