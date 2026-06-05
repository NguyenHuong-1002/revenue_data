'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlantsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalPlants: number;
  plantsLength: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

export function PlantsPagination({
  currentPage,
  totalPages,
  totalPlants,
  plantsLength,
  onPageChange,
}: PlantsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center px-2 py-4">
      <span className="text-xs text-muted-foreground">
        Hiển thị {plantsLength} trên tổng số {totalPlants} nhà kho
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="border-border hover:bg-muted text-muted-foreground cursor-pointer"
        >
          <ChevronLeft className="size-4 mr-1" />
          Trước
        </Button>
        <span className="text-sm font-medium px-3 py-1 bg-muted/40 rounded-lg border border-border">
          Trang {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange((prev) => Math.min(prev + 1, totalPages))}
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
