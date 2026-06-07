'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SupportSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Banner Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Panel: FAQs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Categories skeleton */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>

          {/* FAQs Card skeleton */}
          <Card className="border-border/50 shadow-xs">
            <CardHeader className="border-b border-border/40 pb-4">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="divide-y divide-border/30 p-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Form & Contacts */}
        <div className="flex flex-col gap-6">
          {/* Form skeleton */}
          <Card className="border-border/50 shadow-xs">
            <CardHeader className="pb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Contacts skeleton */}
          <Card className="border-border/50 shadow-xs p-5 space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
