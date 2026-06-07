'use client';

import { DataFilter, FilterField } from '@/components/data-filter';

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

const FIELDS: FilterField[] = [
  {
    key: 'nameFilter',
    type: 'text',
    label: 'Tên sản phẩm',
    colSpan: 2,
    placeholder: 'Ví dụ: Giày Sneaker SANTD Màu Đen...',
  },
  {
    key: 'productIdFilter',
    type: 'text',
    label: 'Mã sản phẩm',
    placeholder: 'Ví dụ: SP1712...',
  },
  {
    key: 'colorFilter',
    type: 'text',
    label: 'Màu sắc',
    placeholder: 'Nhập màu sắc...',
  },
  {
    key: 'genderFilter',
    type: 'select',
    label: 'Giới tính',
    emptyValue: 'ALL',
    options: [
      { value: 'ALL', label: 'Tất cả giới tính' },
      { value: 'MEN', label: 'Nam (MEN)' },
      { value: 'WOM', label: 'Nữ (WOM)' },
      { value: 'BOY', label: 'Bé trai (BOY)' },
      { value: 'GIR', label: 'Bé gái (GIR)' },
    ],
  },
  {
    key: 'groupFilter',
    type: 'select',
    label: 'Nhóm sản phẩm',
    emptyValue: 'ALL',
    options: [
      { value: 'ALL', label: 'Tất cả nhóm' },
      { value: 'SANTD', label: 'SANTD' },
      { value: 'DEPTD', label: 'DEPTD' },
      { value: 'GTTPC', label: 'GTTPC' },
      { value: 'GTTCD', label: 'GTTCD' },
      { value: 'SANTR', label: 'SANTR' },
      { value: 'GIATR', label: 'GIATR' },
      { value: 'PKIEN', label: 'PKIEN' },
      { value: 'TBLTH', label: 'TBLTH' },
      { value: 'TBLTR', label: 'TBLTR' },
    ],
  },
  {
    key: 'ageFilter',
    type: 'select',
    label: 'Độ tuổi',
    emptyValue: 'ALL',
    options: [
      { value: 'ALL', label: 'Tất cả độ tuổi' },
      { value: '0 đến <3 tuổi', label: '0 đến <3 tuổi' },
      { value: '3 đến <6 tuổi', label: '3 đến <6 tuổi' },
      { value: '6 đến <10 tuổi', label: '6 đến <10 tuổi' },
      { value: '10 đến <16 tuổi', label: '10 đến <16 tuổi' },
      { value: '16 đến <24 tuổi', label: '16 đến <24 tuổi' },
      { value: '24 đến <40 tuổi', label: '24 đến <40 tuổi' },
      { value: '40 đến <60 tuổi', label: '40 đến <60 tuổi' },
      { value: 'Trên 60 tuổi', label: 'Trên 60 tuổi' },
      { value: 'Khác', label: 'Khác' },
    ],
  },
  {
    key: 'activityFilter',
    type: 'select',
    label: 'Hoạt động',
    emptyValue: 'ALL',
    options: [
      { value: 'ALL', label: 'Tất cả hoạt động' },
      { value: 'Thường nhật/Trường học', label: 'Thường nhật/Trường học' },
      { value: 'Thể thao', label: 'Thể thao' },
      { value: 'Văn phòng', label: 'Văn phòng' },
      { value: 'Chuyên biệt', label: 'Chuyên biệt' },
      { value: 'Khác', label: 'Khác' },
    ],
  },
  {
    key: 'lifestyleFilter',
    type: 'select',
    label: 'Phong cách sống',
    emptyValue: 'ALL',
    options: [
      { value: 'ALL', label: 'Tất cả phong cách' },
      { value: 'Sport', label: 'Sport' },
      { value: 'Casual', label: 'Casual' },
      { value: 'Fashion', label: 'Fashion' },
      { value: 'Formal', label: 'Formal' },
      { value: 'Khác', label: 'Khác' },
    ],
  },
];

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
  const values: Record<string, string> = {
    nameFilter,
    productIdFilter,
    colorFilter,
    genderFilter,
    groupFilter,
    ageFilter,
    activityFilter,
    lifestyleFilter,
  };

  const handlers: Record<string, (val: string) => void> = {
    nameFilter: onNameFilterChange,
    productIdFilter: onProductIdFilterChange,
    colorFilter: onColorFilterChange,
    genderFilter: onGenderFilterChange,
    groupFilter: onGroupFilterChange,
    ageFilter: onAgeFilterChange,
    activityFilter: onActivityFilterChange,
    lifestyleFilter: onLifestyleFilterChange,
  };

  function handleChange(key: string, val: string) {
    handlers[key]?.(val);
  }

  return (
    <DataFilter
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onClear={onClearFilters}
      title="Bộ lọc & Tìm kiếm sản phẩm"
      cols={4}
    />
  );
}
