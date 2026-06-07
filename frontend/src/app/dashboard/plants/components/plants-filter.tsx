'use client';

// ===== Component thanh tìm kiếm & bộ lọc cho nhà kho (dùng shared DataFilter) =====

import { useState, useEffect } from 'react';
import { DataFilter, FilterField } from '@/components/data-filter';

// ─── Field definitions ────────────────────────────────────────────────────────

const PLANTS_FILTER_FIELDS: FilterField[] = [
  {
    key: 'address',
    type: 'text',
    label: 'Địa chỉ nhà kho',
    placeholder: 'Tìm theo địa chỉ nhà kho...',
  },
  {
    key: 'manager',
    type: 'text',
    label: 'Người quản lý',
    placeholder: 'Tìm theo người quản lý...',
  },
  {
    key: 'region',
    type: 'select',
    label: 'Khu vực',
    emptyValue: 'ALL',
    options: [
      { value: 'ALL', label: 'Tất cả khu vực' },
      { value: 'North', label: 'Miền Bắc' },
      { value: 'Central', label: 'Miền Trung' },
      { value: 'South', label: 'Miền Nam' },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Region = 'ALL' | 'North' | 'Central' | 'South';

interface PlantsFilterProps {
  addressFilter: string;
  managerFilter: string;
  regionFilter: Region;
  /** Kept for API compatibility — layout is now flat, no toggle needed. */
  showAdvancedFilters: boolean;
  /** Kept for API compatibility — no-op in this implementation. */
  onToggleAdvancedFilters: () => void;
  onSearchSubmit: (address: string, manager: string, region: Region) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlantsFilter({
  addressFilter,
  managerFilter,
  regionFilter,
  // showAdvancedFilters and onToggleAdvancedFilters are accepted but unused —
  // DataFilter renders all fields in a flat layout.
  showAdvancedFilters: _showAdvancedFilters,
  onToggleAdvancedFilters: _onToggleAdvancedFilters,
  onSearchSubmit,
  onResetFilters,
  isLoading = false,
}: PlantsFilterProps) {
  // Temporary (uncommitted) values that the user is editing
  const [tempValues, setTempValues] = useState<Record<string, string>>({
    address: addressFilter,
    manager: managerFilter,
    region: regionFilter,
  });

  // Sync temp values when applied/reset values change from the parent
  useEffect(() => {
    setTempValues({
      address: addressFilter,
      manager: managerFilter,
      region: regionFilter,
    });
  }, [addressFilter, managerFilter, regionFilter]);

  const handleChange = (key: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onSearchSubmit(tempValues.address, tempValues.manager, tempValues.region as Region);
  };

  const handleClear = () => {
    onResetFilters();
  };

  return (
    <DataFilter
      fields={PLANTS_FILTER_FIELDS}
      values={tempValues}
      onChange={handleChange}
      onApply={handleApply}
      onClear={handleClear}
      applyLoading={isLoading}
      cols={3}
    />
  );
}
