'use client';

import { SlidersHorizontal, Search, RotateCcw, Shield, Activity, Calendar, X } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  onResetFilters,
  isLoading = false,
}: AccountFiltersProps) {
  if (isLoading) {
    return (
      <Card className="border border-border/80 bg-card/35 backdrop-blur-xs shadow-md overflow-hidden animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/5 p-4 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-1.5 sm:col-span-2 md:col-span-2">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Skeleton className="h-3.5 w-12 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActiveFilters =
    keyword !== '' ||
    roleFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    startDate !== '' ||
    endDate !== '';

  const activeFiltersCount = [
    keyword !== '',
    roleFilter !== 'ALL',
    statusFilter !== 'ALL',
    startDate !== '',
    endDate !== '',
  ].filter(Boolean).length;

  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/5 p-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-bold text-foreground">Bộ lọc & Tìm kiếm</span>
          {activeFiltersCount > 0 && (
            <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/15 border-none text-[10px] px-2 py-0">
              Đang lọc {activeFiltersCount}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Responsive filter controls grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1.5 sm:col-span-2 md:col-span-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Tìm kiếm
            </Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Search className="size-3.5" />
              </span>
              <Input
                type="text"
                placeholder="Họ tên, email hoặc username..."
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                className="h-9 text-xs bg-muted/20 border-border pl-8 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="space-y-1.5 sm:col-span-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Vai trò
            </Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Shield className="size-3.5" />
              </span>
              <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger className="h-9 text-xs bg-muted/20 border-border pl-8 focus:ring-blue-500">
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="STAFF">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5 sm:col-span-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Trạng thái
            </Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Activity className="size-3.5" />
              </span>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-9 text-xs bg-muted/20 border-border pl-8 focus:ring-blue-500">
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
          </div>

          {/* Start Date */}
          <div className="space-y-1.5 sm:col-span-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Từ ngày
            </Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Calendar className="size-3.5" />
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-9 text-xs bg-muted/20 border-border pl-8 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5 sm:col-span-1">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Đến ngày
            </Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Calendar className="size-3.5" />
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-9 text-xs bg-muted/20 border-border pl-8 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Badges & Clear Options */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center pt-3 border-t border-border/40 animate-in fade-in duration-200">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mr-1">
              Đang lọc:
            </span>
            {keyword && (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 py-0.5 px-2 border border-blue-500/10 bg-blue-500/5 text-foreground"
              >
                <span className="text-muted-foreground">Từ khóa:</span> &ldquo;{keyword}&rdquo;
                <button
                  onClick={() => onKeywordChange('')}
                  className="ml-1 text-muted-foreground hover:text-destructive cursor-pointer outline-none"
                  aria-label="Xóa lọc từ khóa"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            )}
            {roleFilter !== 'ALL' && (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 py-0.5 px-2 border border-purple-500/10 bg-purple-500/5 text-foreground"
              >
                <span className="text-muted-foreground">Vai trò:</span>{' '}
                {roleFilter === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                <button
                  onClick={() => onRoleFilterChange('ALL')}
                  className="ml-1 text-muted-foreground hover:text-destructive cursor-pointer outline-none"
                  aria-label="Xóa lọc vai trò"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'ALL' && (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 py-0.5 px-2 border border-emerald-500/10 bg-emerald-500/5 text-foreground"
              >
                <span className="text-muted-foreground">Trạng thái:</span>{' '}
                {statusFilter === 'ACTIVE'
                  ? 'Hoạt động'
                  : statusFilter === 'INACTIVE'
                    ? 'Tạm ngưng'
                    : 'Bị khóa'}
                <button
                  onClick={() => onStatusFilterChange('ALL')}
                  className="ml-1 text-muted-foreground hover:text-destructive cursor-pointer outline-none"
                  aria-label="Xóa lọc trạng thái"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            )}
            {startDate && (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 py-0.5 px-2 border border-amber-500/10 bg-amber-500/5 text-foreground"
              >
                <span className="text-muted-foreground">Từ ngày:</span> {startDate}
                <button
                  onClick={() => onStartDateChange('')}
                  className="ml-1 text-muted-foreground hover:text-destructive cursor-pointer outline-none"
                  aria-label="Xóa lọc ngày bắt đầu"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            )}
            {endDate && (
              <Badge
                variant="secondary"
                className="text-[10px] gap-1 py-0.5 px-2 border border-amber-500/10 bg-amber-500/5 text-foreground"
              >
                <span className="text-muted-foreground">Đến ngày:</span> {endDate}
                <button
                  onClick={() => onEndDateChange('')}
                  className="ml-1 text-muted-foreground hover:text-destructive cursor-pointer outline-none"
                  aria-label="Xóa lọc ngày kết thúc"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            )}
            <button
              onClick={onResetFilters}
              className="ml-auto text-[11px] text-muted-foreground hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors outline-none font-semibold"
            >
              <RotateCcw className="size-3" />
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
