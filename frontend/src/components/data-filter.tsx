'use client';

/**
 * @file DataFilter — Universal filter panel component
 *
 * Dùng chung cho toàn bộ hệ thống. Thay vì hardcode props cho từng trường,
 * bạn khai báo danh sách `fields` và component tự render các control tương ứng.
 *
 * Các loại field được hỗ trợ:
 *  - "text"   → Input text có icon kính lúp (tìm kiếm)
 *  - "select" → Select dropdown với danh sách options
 *  - "month"  → Input type="month" (chọn tháng)
 *  - "date"   → Input type="date"  (chọn ngày)
 *  - "number" → Input type="number"
 *
 * Ví dụ sử dụng:
 * ```tsx
 * import { DataFilter, FilterField } from '@/components/data-filter';
 *
 * const fields: FilterField[] = [
 *   { key: 'productId', type: 'text', label: 'Mã sản phẩm', placeholder: 'SP001...' },
 *   { key: 'channel', type: 'select', label: 'Kênh phân phối',
 *     options: [
 *       { value: 'ALL', label: 'Tất cả' },
 *       { value: 'Online', label: 'Online' },
 *     ],
 *   },
 *   { key: 'fromMonth', type: 'month', label: 'Từ tháng' },
 * ];
 *
 * const [values, setValues] = useState<Record<string, string>>({
 *   productId: '', channel: 'ALL', fromMonth: '',
 * });
 *
 * <DataFilter
 *   fields={fields}
 *   values={values}
 *   onChange={(key, val) => setValues(prev => ({ ...prev, [key]: val }))}
 *   onClear={() => setValues({ productId: '', channel: 'ALL', fromMonth: '' })}
 * />
 * ```
 */

import * as React from 'react';
import { SlidersHorizontal, Search, X, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectOption {
  /** Giá trị thực (gửi lên API / lưu vào state) */
  value: string;
  /** Nhãn hiển thị cho người dùng */
  label: string;
}

export type FilterFieldType = 'text' | 'select' | 'month' | 'date' | 'number';

export interface FilterField {
  /** Key dùng để đọc / ghi vào `values` */
  key: string;
  /** Loại control */
  type: FilterFieldType;
  /** Nhãn hiển thị trên form */
  label: string;
  /** Placeholder (chỉ dùng cho text / number) */
  placeholder?: string;
  /** Danh sách options (bắt buộc với type="select") */
  options?: SelectOption[];
  /**
   * Giá trị "rỗng / mặc định" của field này.
   * Khi giá trị hiện tại === emptyValue thì field được coi là CHƯA lọc.
   * Mặc định: '' (chuỗi rỗng)
   */
  emptyValue?: string;
  /** Số cột mà field chiếm trong grid (1 hoặc 2). Mặc định: 1 */
  colSpan?: 1 | 2;
  /** Số bước tăng (chỉ dùng cho type="number") */
  step?: number;
  /** Min (chỉ dùng cho type="number") */
  min?: number;
  /** Max (chỉ dùng cho type="number") */
  max?: number;
  /** Icon render bên trái control (chỉ text / number) */
  icon?: React.ReactNode;
}

export interface DataFilterProps {
  /** Danh sách trường cần render */
  fields: FilterField[];
  /**
   * Giá trị hiện tại cho mỗi field.
   * Key tương ứng `FilterField.key`.
   */
  values: Record<string, string>;
  /** Callback khi một field thay đổi */
  onChange: (key: string, value: string) => void;
  /** Callback khi nhấn nút "Xóa bộ lọc" */
  onClear?: () => void;
  /** Callback khi nhấn nút "Áp dụng" (tuỳ chọn — dùng khi không muốn live filter) */
  onApply?: () => void;
  /** Text trên nút Áp dụng */
  applyLabel?: string;
  /** Icon render cạnh nút Áp dụng */
  applyIcon?: React.ReactNode;
  /** Disable nút Áp dụng (ví dụ: đang loading) */
  applyLoading?: boolean;
  /** Tiêu đề của panel. Mặc định: "Bộ lọc & Tìm kiếm" */
  title?: string;
  /** Ẩn tiêu đề */
  hideTitle?: boolean;
  /** Số cột mặc định trong grid (responsive). Mặc định: 4 */
  cols?: 2 | 3 | 4 | 5;
  /** Class tuỳ chỉnh cho Card wrapper */
  className?: string;
  /**
   * Hiển thị active-filter badges phía dưới.
   * Mặc định: true
   */
  showActiveBadges?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isFieldActive(field: FilterField, values: Record<string, string>): boolean {
  const val = values[field.key] ?? '';
  const empty = field.emptyValue ?? '';
  return val !== empty && val !== '';
}

function getActiveBadgeLabel(field: FilterField, values: Record<string, string>): string {
  const val = values[field.key] ?? '';
  if (field.type === 'select') {
    const opt = field.options?.find((o) => o.value === val);
    return opt ? opt.label : val;
  }
  return val;
}

// Column span class map
const colSpanClass: Record<1 | 2, string> = {
  1: '',
  2: 'sm:col-span-2',
};

// Grid cols class map
const gridColsClass: Record<2 | 3 | 4 | 5, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual Field Controls
// ─────────────────────────────────────────────────────────────────────────────

interface FieldControlProps {
  field: FilterField;
  value: string;
  onChange: (key: string, value: string) => void;
}

function FieldControl({ field, value, onChange }: FieldControlProps) {
  const handleChange = (val: string) => onChange(field.key, val);

  if (field.type === 'select') {
    return (
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="h-9 text-xs bg-muted/20 border-border">
          <SelectValue placeholder={field.placeholder ?? `Chọn ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === 'month' || field.type === 'date') {
    return (
      <Input
        type={field.type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 text-xs bg-muted/20 border-border"
      />
    );
  }

  // text or number
  const hasIcon = field.type === 'text' || !!field.icon;
  return (
    <div className="relative">
      {hasIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {field.icon ?? <Search className="size-3.5" />}
        </span>
      )}
      <Input
        type={field.type === 'number' ? 'number' : 'text'}
        placeholder={field.placeholder}
        value={value}
        step={field.step}
        min={field.min}
        max={field.max}
        onChange={(e) => handleChange(e.target.value)}
        className={cn('h-9 text-xs bg-muted/20 border-border', hasIcon && 'pl-9')}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function DataFilter({
  fields,
  values,
  onChange,
  onClear,
  onApply,
  applyLabel = 'Áp dụng',
  applyIcon,
  applyLoading = false,
  title = 'Bộ lọc & Tìm kiếm',
  hideTitle = false,
  cols = 4,
  className,
  showActiveBadges = true,
}: DataFilterProps) {
  const activeFields = fields.filter((f) => isFieldActive(f, values));
  const hasActiveFilters = activeFields.length > 0;

  return (
    <Card className={cn('border border-border/80 bg-card/35 backdrop-blur-xs', className)}>
      {!hideTitle && (
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={cn('space-y-4', hideTitle ? 'pt-4' : 'pt-4')}>
        {/* Field grid */}
        <div className={cn('grid gap-4', gridColsClass[cols])}>
          {fields.map((field) => (
            <div key={field.key} className={cn('space-y-1.5', colSpanClass[field.colSpan ?? 1])}>
              <Label className="text-xs font-semibold text-muted-foreground">{field.label}</Label>
              <FieldControl field={field} value={values[field.key] ?? ''} onChange={onChange} />
            </div>
          ))}
        </div>

        {/* Active filter badges */}
        {showActiveBadges && hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40 items-center animate-in fade-in duration-200">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">
              Đang lọc:
            </span>
            {activeFields.map((field) => (
              <Badge
                key={field.key}
                variant="secondary"
                className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground"
              >
                <span className="text-muted-foreground">{field.label}:</span>
                &ldquo;{getActiveBadgeLabel(field, values)}&rdquo;
                <button
                  type="button"
                  onClick={() => onChange(field.key, field.emptyValue ?? '')}
                  className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  aria-label={`Xóa lọc ${field.label}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: Clear + Apply buttons */}
        {(onClear || onApply) && (
          <div
            className={cn(
              'flex items-center pt-2 border-t border-border/40',
              onApply ? 'justify-between' : 'justify-end'
            )}
          >
            {onClear && hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer h-8"
              >
                <RotateCcw className="size-3" />
                Xóa bộ lọc
              </Button>
            )}

            {onApply && (
              <Button
                type="button"
                onClick={onApply}
                disabled={applyLoading}
                className="gap-2 cursor-pointer shadow-xs text-xs font-semibold px-5 h-9 ml-auto"
              >
                {applyLoading ? (
                  <span className="animate-spin size-3.5 border-2 border-current border-t-transparent rounded-full inline-block" />
                ) : (
                  applyIcon
                )}
                {applyLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
