'use client';

// ===== Component phân trang cho danh sách tài khoản =====
// Hiển thị: "Hiển thị X / Y tài khoản" + nút Trước/Sau + trang hiện tại
// Tự động ẩn nếu chỉ có 1 trang

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountPaginationProps {
  currentPage: number;
  totalPages: number;
  totalAccounts: number;
  accountsLength: number;
  onPageChange: (page: number) => void;
}

export function AccountPagination({
  currentPage,
  totalPages,
  totalAccounts,
  accountsLength,
  onPageChange,
}: AccountPaginationProps) {
  // Nếu chỉ có 1 trang hoặc không có trang nào thì ẩn luôn
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center px-2 py-4">
      {/* Bên trái: số lượng hiển thị */}
      <span className="text-xs text-muted-foreground">
        Hiển thị {accountsLength} trên tổng số {totalAccounts} tài khoản
      </span>

      {/* Bên phải: nút điều hướng trang */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline" size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="border-border hover:bg-muted text-muted-foreground cursor-pointer"
        >
          <ChevronLeft className="size-4 mr-1" />
          Trước
        </Button>

        {/* Trang hiện tại / Tổng số trang */}
        <span className="text-sm font-medium px-3 py-1 bg-muted/40 rounded-lg border border-border">
          Trang {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline" size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="border-border hover:bg-muted text-muted-foreground cursor-pointer"
        >
          Sau
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
