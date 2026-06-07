'use client';

import { DataFilter, FilterField } from '@/components/data-filter';

interface InventoryReportsFilterProps {
  productIdFilter: string;
  plantIdFilter: string;
  fromMonth: string;
  toMonth: string;
  onProductIdChange: (val: string) => void;
  onPlantIdChange: (val: string) => void;
  onFromMonthChange: (val: string) => void;
  onToMonthChange: (val: string) => void;
}

const FIELDS: FilterField[] = [
  {
    key: 'productId',
    type: 'text',
    label: 'Mã sản phẩm',
    placeholder: 'Mã sản phẩm (SP...)',
  },
  {
    key: 'plantId',
    type: 'text',
    label: 'Mã nhà máy',
    placeholder: 'Mã nhà máy (PL...)',
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

export function InventoryReportsFilter({
  productIdFilter,
  plantIdFilter,
  fromMonth,
  toMonth,
  onProductIdChange,
  onPlantIdChange,
  onFromMonthChange,
  onToMonthChange,
}: InventoryReportsFilterProps) {
  const values = {
    productId: productIdFilter,
    plantId: plantIdFilter,
    fromMonth,
    toMonth,
  };

  function handleChange(key: string, val: string) {
    if (key === 'productId') onProductIdChange(val);
    else if (key === 'plantId') onPlantIdChange(val);
    else if (key === 'fromMonth') onFromMonthChange(val);
    else if (key === 'toMonth') onToMonthChange(val);
  }

  function handleClear() {
    onProductIdChange('');
    onPlantIdChange('');
    onFromMonthChange('');
    onToMonthChange('');
  }

  return (
    <DataFilter
      fields={FIELDS}
      values={values}
      onChange={handleChange}
      onClear={handleClear}
      cols={4}
    />
  );
}
