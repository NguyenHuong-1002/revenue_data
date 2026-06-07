'use client';

import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductsStatsProps {
  totalProducts: number;
  isLoading?: boolean;
}

export function ProductsStats({ totalProducts, isLoading }: ProductsStatsProps) {
  if (isLoading) {
    return (
      <Card className="w-full bg-card border-border shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-3 w-full">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-8 w-28 rounded" />
          </div>
          <Skeleton className="size-12 rounded-xl shrink-0" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card border-border shadow-md">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-muted-foreground text-sm font-medium">
            Tổng sản phẩm khớp bộ lọc
          </span>
          <p className="text-3xl font-bold text-foreground">
            {totalProducts.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Package className="size-6" />
        </div>
      </CardContent>
    </Card>
  );
}
