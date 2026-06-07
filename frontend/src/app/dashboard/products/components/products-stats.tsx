'use client';

import { Package, Layers, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { IAccount } from '@/lib/types/account';

interface ProductsStatsProps {
  totalProducts: number;
  currentUser: IAccount | null;
  isAdmin: boolean;
}

export function ProductsStats({ totalProducts, currentUser, isAdmin }: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-card border-border shadow-md">
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

      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm font-medium">Giới hạn phân trang</span>
            <p className="text-3xl font-bold text-foreground">30</p>
          </div>
          <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Layers className="size-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm font-medium">Vai trò tài khoản</span>
            <div className="text-xl font-bold text-foreground flex items-center gap-1.5 mt-1">
              {currentUser ? (
                isAdmin ? (
                  <Badge className="bg-blue-600 text-white border-transparent px-2 py-0.5">
                    ADMIN (Toàn quyền)
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-2 py-0.5"
                  >
                    STAFF (Chỉ xem)
                  </Badge>
                )
              ) : (
                <span className="text-xs text-muted-foreground font-normal">Đang tải...</span>
              )}
            </div>
          </div>
          <div className="size-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <ShieldAlert className="size-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
