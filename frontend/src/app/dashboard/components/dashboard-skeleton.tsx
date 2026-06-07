'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4 w-full max-w-xl">
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-6 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
      </div>

      <div className="flex gap-2 border-b border-border/60 pb-px mb-2">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="p-6 flex flex-col justify-between h-32 border border-border/80 bg-card shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-7 w-40 rounded-md" />
            </div>
            <Skeleton className="h-3 w-48 rounded-md mt-1" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="p-5 flex flex-col justify-between h-[120px] border border-border/80 bg-card shadow-sm"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, tableIdx) => (
          <Card key={tableIdx} className="border-border/50 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2 w-2/3">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-3.5 w-56 rounded-md" />
              </div>
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <div className="flex flex-col gap-3.5 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-border/20"
                >
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
