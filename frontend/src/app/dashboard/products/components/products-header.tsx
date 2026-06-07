'use client';

import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductsHeaderProps {
  isAdmin: boolean;
  onAddClick: () => void;
}

export function ProductsHeader({ isAdmin, onAddClick }: ProductsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Package className="size-8 text-blue-500" />
          Quản lý sản phẩm
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Xem danh sách, thêm, chỉnh sửa hoặc xóa sản phẩm trong hệ thống (Tối đa 30 sản
          phẩm/trang).
        </p>
      </div>
      <Button
        disabled={!isAdmin}
        onClick={onAddClick}
        className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm sản phẩm' : undefined}
      >
        <Plus className="size-4 mr-2" />
        Thêm sản phẩm
      </Button>
    </div>
  );
}
