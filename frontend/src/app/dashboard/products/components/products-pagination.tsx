'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function ProductsPagination({
  currentPage,
  totalPages,
  totalProducts,
  onPageChange,
  isLoading,
}: ProductsPaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <span className="text-xs text-muted-foreground">
        Hiển thị trang <strong className="text-foreground">{currentPage}</strong> trên{' '}
        <strong className="text-foreground">{totalPages}</strong> (Tổng cộng{' '}
        <strong className="text-foreground">{totalProducts.toLocaleString('vi-VN')}</strong>{' '}
        sản phẩm)
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1 || isLoading}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline ml-1 text-xs">Trước</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages || isLoading}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <span className="hidden sm:inline mr-1 text-xs">Sau</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
