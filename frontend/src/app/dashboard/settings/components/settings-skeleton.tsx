'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Group tabs selector skeleton */}
      <div className="flex border-b border-border gap-2 overflow-x-auto select-none pb-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pb-3 px-4 py-2 flex items-center gap-2">
            <Skeleton className="size-4 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Settings list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, j) => (
          <div
            key={j}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
          >
            {/* Left side: key info */}
            <div className="space-y-2 max-w-xl flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-64 max-w-full rounded-md" />
            </div>

            {/* Right side: inputs & action buttons */}
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Skeleton className="h-9 flex-1 sm:flex-none sm:w-48 rounded-lg" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
