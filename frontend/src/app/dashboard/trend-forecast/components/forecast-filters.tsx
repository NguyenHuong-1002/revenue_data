'use client';

import { Sparkles } from 'lucide-react';
import { DataFilter, FilterField } from '@/components/data-filter';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ForecastFiltersProps {
  scope: 'all' | 'sales' | 'inventory';
  periodType: 'month' | 'week' | 'quarter';
  horizon: number;
  productId: string;
  branchId: string;
  plantId: string;
  distributionChannel: string;
  updating: boolean;
  onScopeChange: (val: 'all' | 'sales' | 'inventory') => void;
  onPeriodTypeChange: (val: 'month' | 'week' | 'quarter') => void;
  onHorizonChange: (val: number) => void;
  onProductIdChange: (val: string) => void;
  onBranchIdChange: (val: string) => void;
  onPlantIdChange: (val: string) => void;
  onDistributionChannelChange: (val: string) => void;
  onApply: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Field definitions (declared outside component to avoid re-creation)
// ─────────────────────────────────────────────────────────────────────────────

const FIELDS: FilterField[] = [
  {
    key: 'scope',
    type: 'select',
    label: 'Phạm vi dự báo',
    emptyValue: 'all',
    options: [
      { value: 'all', label: 'Tất cả (Doanh số & Tồn kho)' },
      { value: 'sales', label: 'Chỉ Doanh số (Sales)' },
      { value: 'inventory', label: 'Chỉ Tồn kho (Inventory)' },
    ],
  },
  {
    key: 'periodType',
    type: 'select',
    label: 'Chu kỳ gom nhóm (Doanh số)',
    emptyValue: 'month',
    options: [
      { value: 'month', label: 'Theo tháng (Month)' },
      { value: 'week', label: 'Theo tuần (Week)' },
      { value: 'quarter', label: 'Theo quý (Quarter)' },
    ],
  },
  {
    key: 'horizon',
    type: 'number',
    label: 'Chu kỳ dự báo (Horizon)',
    min: 1,
    max: 24,
    step: 1,
  },
  {
    key: 'productId',
    type: 'text',
    label: 'Mã sản phẩm',
    placeholder: 'Ví dụ: P001 (Bỏ trống = tất cả)',
  },
  {
    key: 'branchId',
    type: 'text',
    label: 'Mã chi nhánh (Doanh số)',
    placeholder: 'Ví dụ: BR001',
  },
  {
    key: 'plantId',
    type: 'text',
    label: 'Mã kho hàng (Tồn kho)',
    placeholder: 'Ví dụ: PL001',
  },
  {
    key: 'distributionChannel',
    type: 'select',
    label: 'Kênh phân phối (Doanh số)',
    emptyValue: 'all-channels',
    options: [
      { value: 'all-channels', label: 'Tất cả các kênh' },
      { value: 'Online', label: 'Online' },
      { value: 'Bán lẻ', label: 'Bán lẻ' },
      { value: 'Bán sỉ', label: 'Bán sỉ' },
      { value: 'Siêu thị', label: 'Siêu thị' },
      { value: 'Hợp đồng', label: 'Hợp đồng' },
      { value: 'Chi nhánh', label: 'Chi nhánh' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component — NO local state, values come directly from parent (single source
// of truth). This avoids the useEffect sync loop that caused stale/overwritten
// field values when multiple fields were changed quickly.
// ─────────────────────────────────────────────────────────────────────────────

export function ForecastFilters({
  scope,
  periodType,
  horizon,
  productId,
  branchId,
  plantId,
  distributionChannel,
  updating,
  onScopeChange,
  onPeriodTypeChange,
  onHorizonChange,
  onProductIdChange,
  onBranchIdChange,
  onPlantIdChange,
  onDistributionChannelChange,
  onApply,
}: ForecastFiltersProps) {
  // Build the values record directly from props — no local state needed.
  // DataFilter is fully controlled: every change immediately fires the parent
  // callback, which updates state, which re-renders with the new values.
  const values: Record<string, string> = {
    scope,
    periodType,
    horizon: String(horizon),
    productId,
    branchId,
    plantId,
    distributionChannel,
  };

  const handleChange = (key: string, val: string) => {
    switch (key) {
      case 'scope':
        onScopeChange(val as 'all' | 'sales' | 'inventory');
        break;
      case 'periodType':
        onPeriodTypeChange(val as 'month' | 'week' | 'quarter');
        break;
      case 'horizon':
        onHorizonChange(Number(val));
        break;
      case 'productId':
        onProductIdChange(val);
        break;
      case 'branchId':
        onBranchIdChange(val);
        break;
      case 'plantId':
        onPlantIdChange(val);
        break;
      case 'distributionChannel':
        onDistributionChannelChange(val);
        break;
    }
  };

  return (
    <DataFilter
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onApply={onApply}
      applyLabel="Cập nhật dự báo"
      applyIcon={<Sparkles className="size-3.5" />}
      applyLoading={updating}
      title="Cấu hình mô hình dự báo & Bộ lọc dữ liệu"
      cols={4}
    />
  );
}
