'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsLength: number;
  onPageChange: (page: number) => void;
  itemName: string;
  isLoading?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsLength,
  onPageChange,
  itemName,
  isLoading = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum page buttons to show

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push('ellipsis');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 border-t border-border bg-muted/10 w-full">
      {/* Left side: showing item range info */}
      <span className="text-xs text-muted-foreground order-2 sm:order-1">
        Hiển thị <strong className="text-foreground font-semibold">{itemsLength}</strong> trên tổng
        số <strong className="text-foreground font-semibold">{totalItems}</strong> {itemName}
      </span>

      {/* Right side: Shadcn UI Pagination */}
      <Pagination className="mx-0 w-auto order-1 sm:order-2">
        <PaginationContent className="gap-1 sm:gap-2">
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1 && !isLoading) {
                  onPageChange(currentPage - 1);
                }
              }}
              className={
                currentPage === 1 || isLoading
                  ? 'pointer-events-none opacity-50 border border-border h-8'
                  : 'cursor-pointer border border-border h-8 hover:bg-muted text-muted-foreground'
              }
              text="Trước"
            />
          </PaginationItem>

          {/* Number Links */}
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis className="h-8 w-8" />
                </PaginationItem>
              );
            }

            const isPageActive = currentPage === page;

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={isPageActive}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isLoading && !isPageActive) {
                      onPageChange(page as number);
                    }
                  }}
                  className={cn(
                    'h-8 w-8 text-xs font-semibold rounded-lg transition-colors border',
                    isPageActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-background hover:bg-muted text-muted-foreground cursor-pointer'
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages && !isLoading) {
                  onPageChange(currentPage + 1);
                }
              }}
              className={
                currentPage === totalPages || isLoading
                  ? 'pointer-events-none opacity-50 border border-border h-8'
                  : 'cursor-pointer border border-border h-8 hover:bg-muted text-muted-foreground'
              }
              text="Sau"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
// Helper to merge class names conditionally (copied to avoid dependency import issues if lib/utils is structured differently)
import { cn } from '@/lib/utils';
