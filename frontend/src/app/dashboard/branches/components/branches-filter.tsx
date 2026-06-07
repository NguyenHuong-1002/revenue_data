'use client';

// ===== Component thanh tìm kiếm & bộ lọc cho chi nhánh =====
// Dùng shared DataFilter component để render các control.

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { DataFilter, FilterField } from '@/components/data-filter';

interface BranchesFilterProps {
  cityFilter: string;
  onSearchSubmit: (value: string) => void;
  onClearFilter: () => void;
  isLoading?: boolean;
}

const FIELDS: FilterField[] = [
  {
    key: 'city',
    type: 'text',
    label: 'Tìm theo thành phố',
    placeholder: 'Ví dụ: Hà Nội...',
    icon: <Search className="size-3.5" />,
  },
];

export function BranchesFilter({
  cityFilter,
  onSearchSubmit,
  onClearFilter,
  isLoading = false,
}: BranchesFilterProps) {
  const [tempCity, setTempCity] = useState(cityFilter);

  // Đồng bộ hóa khi bộ lọc thay đổi từ bên ngoài (ví dụ: nhấn đặt lại hoặc chọn từ bản đồ)
  useEffect(() => {
    setTempCity(cityFilter);
  }, [cityFilter]);

  return (
    <DataFilter
      fields={FIELDS}
      values={{ city: tempCity }}
      onChange={(_key, value) => setTempCity(value)}
      onApply={() => onSearchSubmit(tempCity)}
      applyLabel="Tìm kiếm"
      applyLoading={isLoading}
      onClear={onClearFilter}
      hideTitle
      cols={2}
    />
  );
}
