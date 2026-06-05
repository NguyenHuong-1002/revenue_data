'use client';

// ===== Component thanh tìm kiếm & bộ lọc cho chi nhánh =====
// Gồm: ô tìm kiếm thành phố, nút đặt lại,
// các filter tags hiển thị điều kiện đang lọc

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface BranchesFilterProps {
  cityFilter: string;
  onSearchSubmit: (value: string) => void;
  onClearFilter: () => void;
}

export function BranchesFilter({
  cityFilter,
  onSearchSubmit,
  onClearFilter,
}: BranchesFilterProps) {
  const [tempCity, setTempCity] = useState(cityFilter);

  // Đồng bộ hóa khi bộ lọc thay đổi từ bên ngoài (ví dụ: nhấn đặt lại hoặc chọn từ bản đồ)
  useEffect(() => {
    setTempCity(cityFilter);
  }, [cityFilter]);

  const hasAnyFilter = !!cityFilter;

  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(tempCity);
          }}
          className="space-y-4"
        >
          {/* === Dòng chính: Search + Nút Tìm kiếm + Nút Đặt lại === */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Ô tìm kiếm thành phố */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo thành phố (ví dụ: Hà Nội)..."
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                className="pl-9 bg-muted/20 border-border h-10 text-sm"
              />
            </div>

            {/* Nút Tìm kiếm + Nút đặt lại nhanh */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 h-10 text-xs shrink-0 cursor-pointer"
              >
                <Search className="size-3.5 mr-1.5" />
                Tìm kiếm
              </Button>

              {hasAnyFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClearFilter}
                  className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Đặt lại
                </Button>
              )}
            </div>
          </div>

          {/* === Filter tags: hiển thị các điều kiện đang lọc (dùng filter thật đã áp dụng từ parent) === */}
          {hasAnyFilter && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/45 items-center animate-in fade-in duration-200">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">
                Đang lọc theo:
              </span>

              {cityFilter && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Thành phố: &ldquo;{cityFilter}&rdquo;
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onSearchSubmit('')}
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

