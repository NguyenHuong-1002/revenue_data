'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr] animate-in fade-in duration-300">
      {/* Left side: Avatar Management Skeleton */}
      <div className="flex flex-col items-center gap-4">
        <Card className="w-full bg-card border-border shadow-xl p-6 flex flex-col items-center justify-center text-center">
          {/* Circular avatar placeholder */}
          <Skeleton className="size-32 rounded-full" />

          {/* Name placeholder */}
          <Skeleton className="mt-4 h-5 w-32 rounded-md" />

          {/* Username placeholder */}
          <Skeleton className="mt-2 h-3.5 w-24 rounded-md" />

          {/* Role badge placeholder */}
          <Skeleton className="mt-4 h-6 w-24 rounded-full" />
        </Card>
      </div>

      {/* Right side: Account Details & Actions Skeleton */}
      <div className="space-y-6">
        <Card className="bg-card border-border shadow-md overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/10 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {/* Title */}
                <Skeleton className="h-6 w-40 rounded-md" />
                {/* Subtitle */}
                <Skeleton className="h-3.5 w-64 max-w-full rounded-md" />
              </div>
              {/* Badge */}
              <Skeleton className="h-6 w-24 rounded-full hidden sm:block" />
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Personal Details list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ và tên */}
              <div className="p-4 rounded-xl border border-border/50 bg-muted/5 flex items-start gap-3.5">
                <Skeleton className="size-5 rounded-md shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
              </div>

              {/* Tên đăng nhập */}
              <div className="p-4 rounded-xl border border-border/50 bg-muted/5 flex items-start gap-3.5">
                <Skeleton className="size-5 rounded-md shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
              </div>

              {/* Địa chỉ Email */}
              <div className="p-4 rounded-xl border border-border/50 bg-muted/5 flex items-start gap-3.5 sm:col-span-2">
                <Skeleton className="size-5 rounded-md shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-28 rounded-md" />
                  <Skeleton className="h-4 w-48 rounded-md" />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-border/60">
              <Skeleton className="h-9 w-36 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
