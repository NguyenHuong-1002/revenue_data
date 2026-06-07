'use client';

/**
 * SaleReportsFilter — được refactor để dùng DataFilter dùng chung.
 *
 * Khai báo fields một lần, mọi thứ còn lại do DataFilter xử lý.
 */

import * as React from 'react';
import { DataFilter, FilterField } from '@/components/data-filter';

// ─── Định nghĩa các field filter (chỉ cần khai báo 1 lần) ────────────────────
const SALE_FILTER_FIELDS: FilterField[] = [
  {
    key: 'productId',
    type: 'text',
    label: 'Mã sản phẩm',
    placeholder: 'Ví dụ: SP1712 (bỏ trống = tất cả)',
  },
  {
    key: 'branchId',
    type: 'text',
    label: 'Mã chi nhánh',
    placeholder: 'Ví dụ: BR001',
  },
  {
    key: 'channel',
    type: 'select',
    label: 'Kênh phân phối',
    emptyValue: 'ALL',
    options: [
      { value: 'ALL', label: 'Tất cả kênh' },
      { value: 'Online', label: 'Online' },
      { value: 'Bán lẻ', label: 'Bán lẻ' },
      { value: 'Phát sinh', label: 'Phát sinh' },
      { value: 'Bán sỉ', label: 'Bán sỉ' },
      { value: 'Siêu thị', label: 'Siêu thị' },
      { value: 'Hợp đồng', label: 'Hợp đồng' },
      { value: 'Chi nhánh', label: 'Chi nhánh' },
    ],
  },
  {
    key: 'fromMonth',
    type: 'month',
    label: 'Từ tháng',
  },
  {
    key: 'toMonth',
    type: 'month',
    label: 'Đến tháng',
  },
];

const DEFAULT_VALUES: Record<string, string> = {
  productId: '',
  branchId: '',
  channel: 'ALL',
  fromMonth: '',
  toMonth: '',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface SaleReportsFilterProps {
  productIdFilter: string;
  branchIdFilter: string;
  channelFilter: string;
  fromMonth: string;
  toMonth: string;
  onProductIdChange: (val: string) => void;
  onBranchIdChange: (val: string) => void;
  onChannelChange: (val: string) => void;
  onFromMonthChange: (val: string) => void;
  onToMonthChange: (val: string) => void;
}

export function SaleReportsFilter({
  productIdFilter,
  branchIdFilter,
  channelFilter,
  fromMonth,
  toMonth,
  onProductIdChange,
  onBranchIdChange,
  onChannelChange,
  onFromMonthChange,
  onToMonthChange,
}: SaleReportsFilterProps) {
  // Tập hợp values để truyền vào DataFilter
  const values: Record<string, string> = {
    productId: productIdFilter,
    branchId: branchIdFilter,
    channel: channelFilter,
    fromMonth,
    toMonth,
  };

  // Dispatch về từng callback riêng của parent
  const handleChange = (key: string, val: string) => {
    switch (key) {
      case 'productId':
        return onProductIdChange(val);
      case 'branchId':
        return onBranchIdChange(val);
      case 'channel':
        return onChannelChange(val);
      case 'fromMonth':
        return onFromMonthChange(val);
      case 'toMonth':
        return onToMonthChange(val);
    }
  };

  const handleClear = () => {
    onProductIdChange(DEFAULT_VALUES.productId);
    onBranchIdChange(DEFAULT_VALUES.branchId);
    onChannelChange(DEFAULT_VALUES.channel);
    onFromMonthChange(DEFAULT_VALUES.fromMonth);
    onToMonthChange(DEFAULT_VALUES.toMonth);
  };

  return (
    <DataFilter
      fields={SALE_FILTER_FIELDS}
      values={values}
      onChange={handleChange}
      onClear={handleClear}
      title="Bộ lọc báo cáo doanh số"
      cols={5}
    />
  );
}
