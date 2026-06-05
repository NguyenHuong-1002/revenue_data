'use client';

// ===== Component thanh tìm kiếm & bộ lọc nâng cao cho nhà kho =====
// Gồm: ô tìm kiếm địa chỉ, nút bật/tắt bộ lọc nâng cao,
// các filter tags hiển thị điều kiện đang lọc

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlantsFilterProps {
  addressFilter: string;
  managerFilter: string;
  regionFilter: 'ALL' | 'North' | 'Central' | 'South';
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  onSearchSubmit: (address: string, manager: string, region: 'ALL' | 'North' | 'Central' | 'South') => void;
  onResetFilters: () => void;
}

export function PlantsFilter({
  addressFilter,
  managerFilter,
  regionFilter,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  onSearchSubmit,
  onResetFilters,
}: PlantsFilterProps) {
  // Các state tạm thời để hiển thị trên input trước khi người dùng nhấn Tìm kiếm
  const [tempAddress, setTempAddress] = useState(addressFilter);
  const [tempManager, setTempManager] = useState(managerFilter);
  const [tempRegion, setTempRegion] = useState(regionFilter);

  // Đồng bộ hóa state tạm thời khi state chính từ parent thay đổi (ví dụ khi Đặt lại hoặc Xóa tag)
  useEffect(() => {
    setTempAddress(addressFilter);
  }, [addressFilter]);

  useEffect(() => {
    setTempManager(managerFilter);
  }, [managerFilter]);

  useEffect(() => {
    setTempRegion(regionFilter);
  }, [regionFilter]);

  // Kiểm tra xem có filter nào đã được áp dụng và đang active không (để hiển thị badge/nút đặt lại)
  const hasActiveAdvancedFilters = !!managerFilter || regionFilter !== 'ALL';
  const hasAnyFilter = !!addressFilter || !!managerFilter || regionFilter !== 'ALL';

  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit(tempAddress, tempManager, tempRegion);
          }}
          className="space-y-4"
        >
          {/* === Dòng chính: Search + Nút bộ lọc === */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Ô tìm kiếm địa chỉ chính */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo địa chỉ nhà kho..."
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
                className="pl-9 bg-muted/20 border-border h-10 text-sm"
              />
            </div>

            {/* Nút Tìm kiếm + Bộ lọc nâng cao + Đặt lại */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 h-10 text-xs shrink-0 cursor-pointer"
              >
                <Search className="size-3.5 mr-1.5" />
                Tìm kiếm
              </Button>

              <Button
                type="button"
                variant={showAdvancedFilters || hasActiveAdvancedFilters ? 'secondary' : 'outline'}
                onClick={onToggleAdvancedFilters}
                className="h-10 text-xs gap-2 cursor-pointer w-full sm:w-auto font-medium"
              >
                <SlidersHorizontal className="size-3.5" />
                Bộ lọc nâng cao
                {/* Badge hiển thị số lượng filter nâng cao đang bật */}
                {hasActiveAdvancedFilters && (
                  <Badge variant="default" className="ml-1 size-5 rounded-full flex items-center justify-center p-0 text-[10px] bg-blue-600 text-white border-none font-bold">
                    {Number(!!managerFilter) + Number(regionFilter !== 'ALL')}
                  </Badge>
                )}
              </Button>

              {hasAnyFilter && (
                <Button
                  type="button"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Lọc theo khu vực */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Khu vực</span>
                  <Select value={tempRegion} onValueChange={(val: 'ALL' | 'North' | 'Central' | 'South') => setTempRegion(val)}>
                    <SelectTrigger className="w-full border-border h-9 text-xs bg-background">
                      <SelectValue placeholder="Tất cả khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả khu vực</SelectItem>
                      <SelectItem value="North">Miền Bắc</SelectItem>
                      <SelectItem value="Central">Miền Trung</SelectItem>
                      <SelectItem value="South">Miền Nam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lọc theo người quản lý */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Người quản lý</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo người quản lý..."
                      value={tempManager}
                      onChange={(e) => setTempManager(e.target.value)}
                      className="pl-9 bg-background border-border h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === Filter tags: hiển thị các điều kiện đang lọc (dùng filter thật đã áp dụng từ parent) === */}
          {hasAnyFilter && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/45 items-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">Đang lọc theo:</span>

              {addressFilter && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Địa chỉ: &ldquo;{addressFilter}&rdquo;
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onSearchSubmit('', tempManager, tempRegion); // Gửi search ngay với địa chỉ rỗng
                    }}
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              )}

              {regionFilter !== 'ALL' && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Khu vực: {regionFilter === 'North' ? 'Miền Bắc' : regionFilter === 'Central' ? 'Miền Trung' : 'Miền Nam'}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onSearchSubmit(tempAddress, tempManager, 'ALL'); // Gửi search ngay với khu vực rỗng (ALL)
                    }}
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              )}

              {managerFilter && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Người quản lý: &ldquo;{managerFilter}&rdquo;
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onSearchSubmit(tempAddress, '', tempRegion); // Gửi search ngay với quản lý rỗng
                    }}
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

