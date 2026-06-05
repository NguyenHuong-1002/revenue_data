'use client';

// ===== Component thanh tìm kiếm & bộ lọc nâng cao =====
// Gồm: ô tìm kiếm từ khóa, nút bật/tắt bộ lọc nâng cao,
// các filter tags hiển thị điều kiện đang lọc

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  roleFilter: 'ALL' | 'ADMIN' | 'STAFF';
  onRoleFilterChange: (value: 'ALL' | 'ADMIN' | 'STAFF') => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  onStatusFilterChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED') => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export function AccountFilters({
  keyword,
  onKeywordChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  onResetFilters,
  isLoading,
}: AccountFiltersProps) {
  // Kiểm tra xem có filter nào đang active không (không tính keyword)
  const hasActiveFilters = roleFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate;
  const hasAnyFilter = keyword || hasActiveFilters;

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input Skeleton */}
            <div className="relative w-full sm:max-w-md">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            {/* Button Skeleton */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Skeleton className="h-10 w-full sm:w-36 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* === Dòng chính: Search + Nút bộ lọc === */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo họ tên, email hoặc username..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="pl-9 bg-muted/20 border-border h-10 text-sm"
            />
          </div>

          {/* Nút Bộ lọc nâng cao + Đặt lại */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant={showAdvancedFilters || hasActiveFilters ? "secondary" : "outline"}
              onClick={onToggleAdvancedFilters}
              className="h-10 text-xs gap-2 cursor-pointer w-full sm:w-auto font-medium"
            >
              <SlidersHorizontal className="size-3.5" />
              Bộ lọc nâng cao
              {/* Badge hiển thị số lượng filter đang bật */}
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 size-5 rounded-full flex items-center justify-center p-0 text-[10px] bg-blue-600 text-white border-none font-bold">
                  {Number(roleFilter !== 'ALL') + Number(statusFilter !== 'ALL') + Number(!!startDate) + Number(!!endDate)}
                </Badge>
              )}
            </Button>

            {hasAnyFilter && (
              <Button
                variant="ghost"
                onClick={onResetFilters}
                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Đặt lại
              </Button>
            )}
          </div>
        </div>

        {/* === Panel bộ lọc nâng cao (collapsible) === */}
        {showAdvancedFilters && (
          <div className="p-4 bg-muted/20 border border-border/60 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Lọc theo vai trò */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Vai trò</span>
                <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                  <SelectTrigger className="w-full border-border h-9 text-xs">
                    <SelectValue placeholder="Tất cả vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    <SelectItem value="STAFF">Nhân viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lọc theo trạng thái */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Trạng thái</span>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="w-full border-border h-9 text-xs">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                    <SelectItem value="LOCKED">Bị khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lọc theo ngày: Từ ngày */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Từ ngày</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground dark:[color-scheme:dark] h-9 cursor-pointer"
                  max={endDate || undefined}
                />
              </div>

              {/* Lọc theo ngày: Đến ngày */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Đến ngày</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground dark:[color-scheme:dark] h-9 cursor-pointer"
                  min={startDate || undefined}
                />
              </div>
            </div>
          </div>
        )}

        {/* === Filter tags: hiển thị các điều kiện đang lọc (có thể xóa từng cái) === */}
        {hasAnyFilter && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/45 items-center">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">Đang lọc theo:</span>

            {keyword && (
              <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                Từ khóa: &ldquo;{keyword}&rdquo;
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onKeywordChange('')}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            )}

            {roleFilter !== 'ALL' && (
              <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                Vai trò: {roleFilter === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRoleFilterChange('ALL')}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            )}

            {statusFilter !== 'ALL' && (
              <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                Trạng thái: {statusFilter === 'ACTIVE' ? 'Hoạt động' : statusFilter === 'INACTIVE' ? 'Tạm ngưng' : 'Bị khóa'}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onStatusFilterChange('ALL')}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            )}

            {(startDate || endDate) && (
              <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                Thời gian: {startDate || '*'} - {endDate || '*'}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onStartDateChange('');
                    onEndDateChange('');
                  }}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
