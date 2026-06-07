'use client';

import { Package } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProductInfo } from '../types';
import { getProductDisplayName } from '../utils';

interface TopProductsProps {
  products: ProductInfo[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Package className="h-4 w-4 text-purple-500" />
          Top 5 sản phẩm bán chạy nhất
        </CardTitle>
        <CardDescription className="text-xs">
          5 sản phẩm bán chạy nhất, hiển thị doanh thu và số lượng (xếp theo doanh thu)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-5 space-y-3.5">
        {products.length > 0 ? (
          products.map((item, index) => {
            const displayName = getProductDisplayName(item);
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-muted/20 border border-border/50 rounded-xl hover:border-border transition-all"
              >
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold border mt-0.5',
                    index === 0
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : index === 1
                        ? 'bg-slate-300/30 text-slate-600 dark:text-slate-400 border-slate-300/40'
                        : 'bg-primary/10 text-primary border-primary/20'
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-bold text-foreground text-xs md:text-sm truncate"
                    title={displayName}
                  >
                    {displayName}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>Mã: {item.id}</span>
                    <span>
                      Đã bán:{' '}
                      <span className="font-semibold text-foreground">{item.quantity} chiếc</span>
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-primary text-xs md:text-sm">
                    {new Intl.NumberFormat('vi-VN').format(item.revenue)} đ
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-xl">
            <span className="text-xs text-muted-foreground">
              Không có dữ liệu sản phẩm bán chạy
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
