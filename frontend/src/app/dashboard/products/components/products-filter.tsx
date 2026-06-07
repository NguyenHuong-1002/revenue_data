'use client';

import { Search, Settings2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductsFilterProps {
  productIdFilter: string;
  colorFilter: string;
  genderFilter: string;
  groupFilter: string;
  ageFilter: string;
  activityFilter: string;
  lifestyleFilter: string;
  nameFilter: string;
  onProductIdFilterChange: (val: string) => void;
  onColorFilterChange: (val: string) => void;
  onGenderFilterChange: (val: string) => void;
  onGroupFilterChange: (val: string) => void;
  onAgeFilterChange: (val: string) => void;
  onActivityFilterChange: (val: string) => void;
  onLifestyleFilterChange: (val: string) => void;
  onNameFilterChange: (val: string) => void;
  onClearFilters: () => void;
}

export function ProductsFilter({
  productIdFilter,
  colorFilter,
  genderFilter,
  groupFilter,
  ageFilter,
  activityFilter,
  lifestyleFilter,
  nameFilter,
  onProductIdFilterChange,
  onColorFilterChange,
  onGenderFilterChange,
  onGroupFilterChange,
  onAgeFilterChange,
  onActivityFilterChange,
  onLifestyleFilterChange,
  onNameFilterChange,
  onClearFilters,
}: ProductsFilterProps) {
  const hasActiveFilters =
    !!productIdFilter ||
    !!colorFilter ||
    genderFilter !== 'ALL' ||
    groupFilter !== 'ALL' ||
    ageFilter !== 'ALL' ||
    activityFilter !== 'ALL' ||
    lifestyleFilter !== 'ALL' ||
    !!nameFilter;

  return (
    <Card className="bg-card border-border shadow-md">
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
          <Settings2 className="size-4 text-blue-500" />
          Bộ lọc & Tìm kiếm sản phẩm
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Combined Name */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3 text-amber-500" />
              Tìm theo Tên sản phẩm (màu sắc, loại, size...)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Ví dụ: Giày Sneaker SANTD Màu Đen..."
                value={nameFilter}
                onChange={(e) => onNameFilterChange(e.target.value)}
                className="pl-9 bg-muted/20 border-border"
              />
            </div>
          </div>

          {/* Search ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Mã sản phẩm (DB)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Ví dụ: SP1712..."
                value={productIdFilter}
                onChange={(e) => onProductIdFilterChange(e.target.value)}
                className="pl-9 bg-muted/20 border-border"
              />
            </div>
          </div>

          {/* Search Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Màu sắc (DB)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Nhập màu sắc..."
                value={colorFilter}
                onChange={(e) => onColorFilterChange(e.target.value)}
                className="pl-9 bg-muted/20 border-border"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
          {/* Gender Filter */}
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <label className="text-xs font-semibold text-muted-foreground">Giới tính</label>
            <Select
              value={genderFilter}
              onValueChange={onGenderFilterChange}
            >
              <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                <SelectValue placeholder="Tất cả giới tính" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">Tất cả giới tính</SelectItem>
                <SelectItem value="MEN">Nam (MEN)</SelectItem>
                <SelectItem value="WOM">Nữ (WOM)</SelectItem>
                <SelectItem value="BOY">Bé trai (BOY)</SelectItem>
                <SelectItem value="GIR">Bé gái (GIR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Nhóm sản phẩm</label>
            <Select
              value={groupFilter}
              onValueChange={onGroupFilterChange}
            >
              <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                <SelectValue placeholder="Tất cả nhóm" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">Tất cả nhóm</SelectItem>
                <SelectItem value="SANTD">SANTD</SelectItem>
                <SelectItem value="DEPTD">DEPTD</SelectItem>
                <SelectItem value="GTTPC">GTTPC</SelectItem>
                <SelectItem value="GTTCD">GTTCD</SelectItem>
                <SelectItem value="SANTR">SANTR</SelectItem>
                <SelectItem value="GIATR">GIATR</SelectItem>
                <SelectItem value="PKIEN">PKIEN</SelectItem>
                <SelectItem value="TBLTH">TBLTH</SelectItem>
                <SelectItem value="TBLTR">TBLTR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age Group */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Độ tuổi</label>
            <Select
              value={ageFilter}
              onValueChange={onAgeFilterChange}
            >
              <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                <SelectValue placeholder="Tất cả độ tuổi" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">Tất cả độ tuổi</SelectItem>
                <SelectItem value="0 đến <3 tuổi">0 đến &lt;3 tuổi</SelectItem>
                <SelectItem value="3 đến <6 tuổi">3 đến &lt;6 tuổi</SelectItem>
                <SelectItem value="6 đến <10 tuổi">6 đến &lt;10 tuổi</SelectItem>
                <SelectItem value="10 đến <16 tuổi">10 đến &lt;16 tuổi</SelectItem>
                <SelectItem value="16 đến <24 tuổi">16 đến &lt;24 tuổi</SelectItem>
                <SelectItem value="24 đến <40 tuổi">24 đến &lt;40 tuổi</SelectItem>
                <SelectItem value="40 đến <60 tuổi">40 đến &lt;60 tuổi</SelectItem>
                <SelectItem value="Trên 60 tuổi">Trên 60 tuổi</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Group */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Hoạt động</label>
            <Select
              value={activityFilter}
              onValueChange={onActivityFilterChange}
            >
              <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                <SelectValue placeholder="Tất cả hoạt động" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">Tất cả hoạt động</SelectItem>
                <SelectItem value="Thường nhật/Trường học">Thường nhật/Trường học</SelectItem>
                <SelectItem value="Thể thao">Thể thao</SelectItem>
                <SelectItem value="Văn phòng">Văn phòng</SelectItem>
                <SelectItem value="Chuyên biệt">Chuyên biệt</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lifestyle Group */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Phong cách sống</label>
            <Select
              value={lifestyleFilter}
              onValueChange={onLifestyleFilterChange}
            >
              <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                <SelectValue placeholder="Tất cả phong cách" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="ALL">Tất cả phong cách</SelectItem>
                <SelectItem value="Sport">Sport</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Khác">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="h-9 px-4 border-border text-muted-foreground hover:text-foreground cursor-pointer text-xs"
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
