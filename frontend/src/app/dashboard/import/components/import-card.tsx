'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  UploadCloud,
  Info,
  RefreshCw,
  FileSpreadsheet,
  Undo2,
  Redo2,
  Save,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { UploadStatus, UploadState } from './upload-status';

export interface ExcelSampleRow {
  status: 'valid' | 'invalid';
  data: Record<string, string | number>;
  note: string;
}

export interface ExcelSampleData {
  headers: string[];
  rows: ExcelSampleRow[];
}

function getExcelColumnLetter(index: number): string {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

const detectFileType = (fileHeaders: string[]): 'products' | 'sales' | 'inventory' | 'unknown' => {
  const headersLower = fileHeaders.map((h) => String(h).toLowerCase().trim());

  if (headersLower.includes('sale_id') || headersLower.includes('sold_quantity')) {
    return 'sales';
  }
  if (headersLower.includes('inventory_id') || headersLower.includes('calendar_year_week')) {
    return 'inventory';
  }
  if (
    headersLower.includes('listing_price') ||
    headersLower.includes('price_cost') ||
    headersLower.includes('detail_product_group')
  ) {
    return 'products';
  }

  // Alternative fallback based on overlap count
  const productsOverlap = headersLower.filter((h) =>
    ['color', 'listing_price', 'price_cost', 'gender', 'size', 'product_id'].includes(h)
  ).length;
  const salesOverlap = headersLower.filter((h) =>
    ['sale_id', 'sold_quantity', 'distribution_channel', 'branch_id', 'product_id'].includes(h)
  ).length;
  const inventoryOverlap = headersLower.filter((h) =>
    ['inventory_id', 'plant_id', 'calendar_year_week', 'product_id'].includes(h)
  ).length;

  const max = Math.max(productsOverlap, salesOverlap, inventoryOverlap);
  if (max > 1) {
    // must have at least 2 matching headers to classify
    if (max === productsOverlap) return 'products';
    if (max === salesOverlap) return 'sales';
    if (max === inventoryOverlap) return 'inventory';
  }

  return 'unknown';
};

const typeNames = {
  products: 'Danh mục sản phẩm (Products)',
  sales: 'Báo cáo doanh số (Sales)',
  inventory: 'Báo cáo tồn kho (Inventory)',
  unknown: 'Định dạng không xác định',
};

interface ValidationResult {
  total: number;
  validRowsCount: number;
  invalidRowsCount: number;
  validRows2D: any[][];
  invalidRows: { rowNum: number; data: Record<string, string | number>; errors: string[] }[];
}

const validateExcelRows = (
  headers: string[],
  rows2D: any[][],
  category: 'products' | 'sales' | 'inventory'
): ValidationResult => {
  const validRows2D: any[][] = [];
  const invalidRows: { rowNum: number; data: Record<string, string | number>; errors: string[] }[] =
    [];

  rows2D.forEach((row, idx) => {
    const rowNum = idx + 2; // Data starts at Row 2 in Excel
    const errors: string[] = [];

    // Normalize row data
    const rowData: Record<string, string | number> = {};
    headers.forEach((h, colIdx) => {
      const cellVal = row[colIdx];
      const valStr = cellVal !== undefined && cellVal !== null ? String(cellVal).trim() : '';
      rowData[h] = valStr;
      
      // Map aliases for validation
      const hLower = h.toLowerCase().trim();
      if (hLower === 'cost_price') rowData['price_cost'] = valStr;
      if (hLower === 'month') rowData['time_report'] = valStr;
      if (hLower === 'plant') rowData['plant_id'] = valStr;
    });

    if (category === 'products') {
      if (!rowData.product_id) {
        errors.push('Thiếu mã sản phẩm (product_id)');
      }

      const lpVal = String(rowData.listing_price || '').trim();
      const lp = Number(lpVal);
      if (lpVal === '') {
        errors.push('Thiếu giá bán (listing_price)');
      } else if (isNaN(lp)) {
        errors.push(`Giá bán không phải là số hợp lệ: "${lpVal}"`);
      } else if (lp < 0) {
        errors.push(`Giá bán không được nhỏ hơn 0: ${lp}`);
      }

      const pcVal = String(rowData.price_cost || '').trim();
      if (pcVal !== '') {
        const pc = Number(pcVal);
        if (isNaN(pc)) {
          errors.push(`Giá vốn không phải là số hợp lệ: "${pcVal}"`);
        } else if (pc < 0) {
          errors.push(`Giá vốn không được nhỏ hơn 0: ${pc}`);
        }
      }
    } else if (category === 'sales') {
      // sale_id is NOT required in Excel template (backend auto-generates uuid)
      if (!rowData.product_id) {
        errors.push('Thiếu mã sản phẩm (product_id)');
      }

      const qtyVal = String(rowData.sold_quantity || '').trim();
      const qty = Number(qtyVal);
      if (qtyVal === '') {
        errors.push('Thiếu số lượng bán (sold_quantity)');
      } else if (isNaN(qty)) {
        errors.push(`Số lượng bán không phải là số hợp lệ: "${qtyVal}"`);
      } else if (qty < 0) {
        errors.push(`Số lượng bán không được nhỏ hơn 0: ${qty}`);
      }

      if (!rowData.time_report) {
        errors.push('Thiếu thời gian báo cáo (month / time_report)');
      }
    } else if (category === 'inventory') {
      // inventory_id is NOT required in Excel template (backend auto-generates uuid)
      if (!rowData.product_id) {
        errors.push('Thiếu mã sản phẩm (product_id)');
      }
      if (!rowData.plant_id) {
        errors.push('Thiếu mã nhà máy (plant / plant_id)');
      }

      const qtyVal = String(rowData.quantity || '').trim();
      const qty = Number(qtyVal);
      if (qtyVal === '') {
        errors.push('Thiếu số lượng tồn kho (quantity)');
      } else if (isNaN(qty)) {
        errors.push(`Số lượng tồn kho không phải là số hợp lệ: "${qtyVal}"`);
      } else if (qty < 0) {
        errors.push(`Số lượng tồn kho không được nhỏ hơn 0: ${qty}`);
      }
    }

    if (errors.length > 0) {
      invalidRows.push({ rowNum, data: rowData, errors });
    } else {
      validRows2D.push(row);
    }
  });

  return {
    total: rows2D.length,
    validRowsCount: validRows2D.length,
    invalidRowsCount: invalidRows.length,
    validRows2D,
    invalidRows,
  };
};

const rebuildExcelFile = (
  headers: string[],
  validRows2D: any[][],
  originalFileName: string
): File => {
  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...validRows2D];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return new File([blob], originalFileName.replace(/\.xlsx$/, '_filtered.xlsx'), {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
};

interface ImportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  sampleData: ExcelSampleData;
  uploadFn: (file: File) => Promise<any>;
  successMessage: string;
  colorTheme: {
    hoverBorder: string;
    iconBg: string;
    buttonBg: string;
    infoIconText: string;
    statusText: string;
  };
}

export function ImportCard({
  title,
  description,
  icon,
  sampleData,
  uploadFn,
  successMessage,
  colorTheme,
}: ImportCardProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    loading: false,
    success: false,
    error: null,
    stats: null,
  });

  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: Record<string, string | number>[];
  } | null>(null);

  // Excel Cell Selection State
  const [selectedCell, setSelectedCell] = useState<{
    rowNum: number;
    colLetter: string;
    value: string;
  } | null>(null);

  const [isDragActive, setIsDragActive] = useState(false);

  // Report Mismatch Warning State
  const [formatWarning, setFormatWarning] = useState<{
    detectedType: 'products' | 'sales' | 'inventory' | 'unknown';
    expectedType: 'products' | 'sales' | 'inventory';
    mismatch: boolean;
  } | null>(null);

  // Warning Modal display control state
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Raw workbook sheet data
  const [rawSheetData, setRawSheetData] = useState<{
    headers: string[];
    rows2D: any[][];
  } | null>(null);

  // Validation results state
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);

  // Validation Preview Modal display control state
  const [showValidationModal, setShowValidationModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      toast.error('Định dạng tệp tin không hợp lệ! Vui lòng chọn tệp Excel (.xlsx hoặc .xls).');
      return;
    }

    setUploadState({
      file: selectedFile,
      loading: false,
      success: false,
      error: null,
      stats: null,
    });

    // Parse file for preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        const arr = new Uint8Array(data as ArrayBuffer);
        const wb = XLSX.read(arr, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows2d = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        if (rows2d.length > 0) {
          const fileHeaders = rows2d[0].map((h, i) =>
            h !== undefined && h !== null && String(h).trim() !== ''
              ? String(h).trim()
              : `Cột ${i + 1}`
          );
          const fileRows2D = rows2d.slice(1);

          setRawSheetData({
            headers: fileHeaders,
            rows2D: fileRows2D,
          });

          // Classify expected and uploaded types
          const expectedType = detectFileType(sampleData.headers) as
            | 'products'
            | 'sales'
            | 'inventory';
          const detectedType = detectFileType(fileHeaders);

          const expectedHeaders = sampleData.headers;
          const matchingHeaders = fileHeaders.filter((h) => expectedHeaders.includes(h));
          const matchRatio = matchingHeaders.length / expectedHeaders.length;

          if (detectedType !== 'unknown' && detectedType !== expectedType) {
            setFormatWarning({
              detectedType,
              expectedType,
              mismatch: true,
            });
            setShowWarningModal(true); // Open modal popup warning
            toast.warning(
              `Phát hiện sai mẫu nhập! Có vẻ đây là tệp tin của mục ${typeNames[detectedType]}.`
            );
          } else if (detectedType === 'unknown' && matchRatio < 0.3) {
            // Less than 30% match ratio - completely unrecognized structure
            setFormatWarning({
              detectedType: 'unknown',
              expectedType,
              mismatch: true,
            });
            setShowWarningModal(true); // Open modal popup warning
            toast.warning(`Định dạng tệp tin tải lên không trùng khớp với cấu trúc tiêu chuẩn.`);
          } else {
            setFormatWarning(null);
            setShowWarningModal(false);
          }

          // Read up to 5 data rows
          const fileRows = rows2d.slice(1, 6).map((row) => {
            const rowData: Record<string, string | number> = {};
            fileHeaders.forEach((header, colIdx) => {
              rowData[header] =
                row[colIdx] !== undefined && row[colIdx] !== null ? row[colIdx] : '';
            });
            return rowData;
          });

          setPreviewData({
            headers: fileHeaders,
            rows: fileRows,
          });
        }
      } catch (error) {
        console.error('Error parsing excel file', error);
        toast.error('Không thể đọc dữ liệu xem trước của file Excel.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleExcel = () => {
    try {
      // Map all rows from sampleData to raw workbook format
      const allRowsData = sampleData.rows.map((r) => {
        const rowData: Record<string, string | number> = {};
        sampleData.headers.forEach((h) => {
          rowData[h] = r.data[h] !== undefined ? r.data[h] : '';
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(allRowsData, { header: sampleData.headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      const cleanTitle = title.toLowerCase().includes('sản phẩm')
        ? 'Products'
        : title.toLowerCase().includes('doanh số')
          ? 'Sales'
          : 'Inventory';

      const fileName = `Mau_Kiem_Thu_${cleanTitle}_8_Rows.xlsx`;

      XLSX.writeFile(workbook, fileName);
      toast.success(`Tải xuống tệp tin mẫu ${fileName} thành công!`);
    } catch (error) {
      console.error('Error generating sample excel file', error);
      toast.error('Không thể tạo tệp tin mẫu Excel.');
    }
  };

  const handleUpload = () => {
    if (!uploadState.file || !rawSheetData) {
      toast.error('Vui lòng chọn tệp tin trước khi tải lên.');
      return;
    }

    // Classify expected type
    const expectedType = detectFileType(sampleData.headers) as 'products' | 'sales' | 'inventory';

    // Execute validation on all rows in rawSheetData
    const result = validateExcelRows(rawSheetData.headers, rawSheetData.rows2D, expectedType);

    setValidationResults(result);
    setShowValidationModal(true); // Open the verification preview modal!
  };

  const handleConfirmUpload = async (onlyValid: boolean) => {
    setShowValidationModal(false);

    if (!uploadState.file || !rawSheetData || !validationResults) return;

    let fileToUpload = uploadState.file;

    if (onlyValid) {
      if (validationResults.validRows2D.length === 0) {
        toast.error('Không thể tải lên vì tất cả các hàng trong tệp tin đều không hợp lệ!');
        return;
      }
      // Rebuild a new Excel file containing only valid rows
      fileToUpload = rebuildExcelFile(
        rawSheetData.headers,
        validationResults.validRows2D,
        uploadState.file.name
      );
    }

    try {
      setUploadState((prev) => ({ ...prev, loading: true, error: null, success: false }));

      const res = await uploadFn(fileToUpload);

      if (res.data?.success) {
        setUploadState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          stats: res.data.stats,
        }));
        toast.success(successMessage);
      } else {
        throw new Error(res.data?.message || 'Có lỗi xảy ra trong quá trình xử lý.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi kết nối máy chủ.';
      setUploadState((prev) => ({
        ...prev,
        loading: false,
        error: errMsg,
      }));
      toast.error(`Nhập dữ liệu thất bại: ${errMsg}`);
    }
  };

  const resetUpload = () => {
    setUploadState({
      file: null,
      loading: false,
      success: false,
      error: null,
      stats: null,
    });
    setPreviewData(null); // Clear preview data
    setFormatWarning(null); // Reset warning
    setShowWarningModal(false); // Reset warning modal
    setRawSheetData(null);
    setValidationResults(null);
    setShowValidationModal(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine active cell (defaults to B2: first data cell)
  const defaultColLetter = 'B';
  const defaultRowNum = 2;
  const firstHeader = sampleData.headers[0];
  const defaultValue =
    sampleData.rows[0] && firstHeader ? String(sampleData.rows[0].data[firstHeader] || '') : '';

  const activeCell = selectedCell || {
    rowNum: defaultRowNum,
    colLetter: defaultColLetter,
    value: defaultValue,
  };

  return (
    <Card className="border-border/40 shadow-sm p-6 md:p-8 flex flex-col gap-8">
      {/* Card Header */}
      <div className="flex flex-col gap-2 border-b border-border/30 pb-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>

      {/* Card Content - Vertical Stack */}
      <div className="flex flex-col gap-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />

        {/* Dropzone & Action Box */}
        <div className="flex flex-col gap-4">
          <div
            onClick={triggerFileInput}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 min-h-[170px] select-none outline-none',
              isDragActive
                ? 'border-indigo-500 bg-indigo-500/[0.04] dark:bg-indigo-950/10 shadow-[0_0_20px_-3px_rgba(var(--chart-4-rgb), 0.15)] scale-[1.01]'
                : uploadState.file
                  ? 'border-emerald-500/50 bg-emerald-500/[0.01] hover:border-emerald-500 hover:bg-emerald-500/[0.03]'
                  : cn('border-border/80 hover:bg-muted/10 bg-muted/5', colorTheme.hoverBorder)
            )}
          >
            {uploadState.file ? (
              <div
                className={cn(
                  'flex items-center gap-4 w-full p-4 rounded-xl border relative overflow-hidden group transition-colors duration-200',
                  formatWarning?.mismatch
                    ? 'border-rose-500/20 bg-rose-500/[0.01] dark:bg-rose-950/5'
                    : 'border-emerald-500/20 bg-emerald-500/[0.02] dark:bg-emerald-950/5'
                )}
              >
                {/* Visual indicator accent bar */}
                <div
                  className={cn(
                    'absolute left-0 top-0 bottom-0 w-1 transition-colors duration-200',
                    formatWarning?.mismatch ? 'bg-rose-500' : 'bg-emerald-500'
                  )}
                />

                {/* Excel File Icon */}
                <div
                  className={cn(
                    'p-3 rounded-lg shrink-0 transition-colors duration-200',
                    formatWarning?.mismatch
                      ? 'bg-rose-500/10 dark:bg-rose-500/25 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  )}
                >
                  <FileSpreadsheet className="h-6 w-6" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-sm font-semibold text-foreground truncate max-w-[90%]">
                    {uploadState.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>{(uploadState.file.size / 1024).toFixed(1)} KB</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                    <span>Định dạng Excel</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                    {formatWarning?.mismatch ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 inline animate-pulse" />
                        Sai mẫu nhập liệu
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Sẵn sàng tải lên
                      </span>
                    )}
                  </p>
                </div>

                {/* Cancel selection button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload();
                  }}
                  className="absolute right-4 p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 rounded-full transition-all duration-150 cursor-pointer"
                  title="Hủy chọn tệp tin"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-center py-2">
                <div
                  className={cn(
                    'p-4 rounded-full shrink-0 transition-all duration-300 shadow-sm',
                    isDragActive
                      ? 'scale-110 bg-indigo-500/20 text-indigo-600 dark:text-indigo-450 animate-pulse'
                      : colorTheme.iconBg
                  )}
                >
                  <UploadCloud
                    className={cn(
                      'h-7 w-7 transition-transform duration-300',
                      isDragActive && 'translate-y-[-2px]'
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDragActive
                      ? 'Thả tệp tin tại đây...'
                      : 'Chọn tệp cấu trúc chuẩn hoặc Kéo thả vào đây'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Chỉ nhận tệp bảng tính Excel{' '}
                    <span className="font-semibold text-foreground">.xlsx</span> hoặc{' '}
                    <span className="font-semibold text-foreground">.xls</span> (Dung lượng tối đa
                    10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {uploadState.file &&
            !uploadState.success &&
            (formatWarning?.mismatch ? (
              <Button
                disabled
                className="w-full rounded-xl mt-1 py-5 font-semibold text-sm bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Tải lên bị khóa do sai mẫu dữ liệu
              </Button>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={uploadState.loading}
                className={cn(
                  'w-full rounded-xl text-white cursor-pointer mt-1 py-5 font-semibold text-sm transition-all duration-200 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] hover:shadow-md active:scale-[0.99]',
                  colorTheme.buttonBg
                )}
              >
                {uploadState.loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UploadCloud className="h-4 w-4 mr-2" />
                )}
                Tiến hành tải lên tệp tin
              </Button>
            ))}
        </div>

        {/* Excel Mockup Window Wrapper */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-foreground select-none">
            <div className="flex items-center gap-2 font-semibold">
              <Info className={cn('h-4 w-4', colorTheme.infoIconText)} />
              <span>
                Mẫu cấu trúc tệp Excel gợi ý (Bấm vào ô để xem nội dung công thức/dữ liệu):
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleExcel}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold border-[#107c41]/30 hover:border-[#107c41] text-[#107c41] hover:bg-[#107c41]/5 flex items-center gap-1.5 w-fit cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Tải tệp Excel kiểm thử (.xlsx)
            </Button>
          </div>

          {/* Microsoft Excel Simulator Window */}
          <div className="flex flex-col border border-slate-300 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950 font-sans select-none">
            {/* 1. Title bar */}
            <div className="h-9 bg-[#107c41] text-white flex items-center justify-between px-3 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <FileSpreadsheet className="h-4 w-4 shrink-0 text-white" />
                <span className="truncate max-w-[220px] sm:max-w-md">
                  {title.toLowerCase().includes('sản phẩm')
                    ? 'Mau_San_Pham_Products'
                    : title.toLowerCase().includes('doanh số')
                      ? 'Mau_Doanh_So_Sales'
                      : 'Mau_Ton_Kho_Inventory'}
                  _Template.xlsx - Microsoft Excel
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/90">
                <span className="hidden sm:inline bg-emerald-700/60 px-2 py-0.5 rounded text-white font-medium select-none">
                  Bản xem mẫu
                </span>
                {/* Mock Window buttons */}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40 cursor-default block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40 cursor-default block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 cursor-default block"></span>
                </div>
              </div>
            </div>

            {/* 2. Menu bar */}
            <div className="h-8 bg-[#f3f2f1] dark:bg-zinc-900 border-b border-slate-300 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 flex items-center gap-4 px-3 overflow-x-auto whitespace-nowrap scrollbar-none">
              <div className="flex items-center gap-2 mr-2 border-r border-slate-300 dark:border-zinc-700 pr-2">
                <Save className="h-3 w-3 text-slate-500 dark:text-zinc-400 hover:text-[#107c41] dark:hover:text-emerald-400 cursor-default" />
                <Undo2 className="h-3 w-3 text-slate-500 dark:text-zinc-400 hover:text-[#107c41] dark:hover:text-emerald-400 cursor-default" />
                <Redo2 className="h-3 w-3 text-slate-500 dark:text-zinc-400 hover:text-[#107c41] dark:hover:text-emerald-400 cursor-default" />
              </div>
              <span className="px-2 py-1 font-semibold text-[#107c41] border-b-2 border-b-[#107c41] bg-white dark:bg-zinc-950 dark:border-b-emerald-500 cursor-default text-[10.5px]">
                Trang chủ
              </span>
              <span className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer rounded">
                Chèn
              </span>
              <span className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer rounded">
                Bố trí trang
              </span>
              <span className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer rounded">
                Công thức
              </span>
              <span className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer rounded">
                Dữ liệu
              </span>
              <span className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer rounded">
                Xem xét
              </span>
              <span className="px-1.5 py-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 cursor-pointer rounded">
                Hiển thị
              </span>
            </div>

            {/* 3. Ribbon Formatting Bar Mockup */}
            <div className="h-9 bg-[#f3f2f1] dark:bg-zinc-900 border-b border-slate-300 dark:border-zinc-800 flex items-center px-3 gap-4 overflow-x-auto whitespace-nowrap scrollbar-none text-slate-600 dark:text-zinc-400 text-xs">
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-slate-800 dark:text-zinc-200 font-medium">
                <span>Aptos</span>
                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                <span className="border-l border-slate-200 dark:border-zinc-800 pl-1.5 ml-1">
                  11
                </span>
                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
              </div>

              <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-zinc-700 pr-3">
                <button className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-850 rounded text-slate-700 dark:text-zinc-300">
                  <Bold className="h-3 w-3" />
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-850 rounded text-slate-700 dark:text-zinc-300">
                  <Italic className="h-3 w-3" />
                </button>
                <button className="w-5 h-5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-850 rounded text-slate-700 dark:text-zinc-300">
                  <Underline className="h-3 w-3" />
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[#107c41] dark:text-emerald-400 font-semibold">
                  Bản mẫu tối ưu
                </span>
                <span>(Cột A: Trạng thái hệ thống, Cột cuối: Ghi chú)</span>
              </div>
            </div>

            {/* 4. Formula Bar */}
            <div className="h-8 bg-white dark:bg-zinc-950 border-b border-slate-300 dark:border-zinc-800 flex items-center px-2 gap-1.5">
              <div className="w-12 h-5 border border-slate-300 dark:border-zinc-700 bg-[#f3f2f1] dark:bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-[#107c41] dark:text-emerald-400 rounded select-none font-bold">
                {activeCell.colLetter}
                {activeCell.rowNum}
              </div>
              <div className="w-[1px] h-4 bg-slate-300 dark:bg-zinc-800" />
              <div className="italic font-serif text-[#107c41] dark:text-emerald-500 font-bold select-none px-1 text-[13px] w-6 text-center">
                fx
              </div>
              <div className="w-[1px] h-4 bg-slate-300 dark:bg-zinc-800" />
              <div className="flex-1 h-5 border border-slate-300 dark:border-zinc-700 px-2.5 flex items-center font-sans text-[11px] text-slate-800 dark:text-zinc-200 bg-[#fafafa] dark:bg-zinc-900/50 rounded overflow-hidden select-text cursor-text font-mono truncate">
                {activeCell.value}
              </div>
            </div>

            {/* 5. Sheet Grid */}
            <div className="overflow-x-auto bg-[#e1dfdd] dark:bg-zinc-900 max-w-full">
              <table className="w-full border-collapse text-[11px] font-sans min-w-[700px] border-spacing-0">
                <thead>
                  <tr className="bg-[#f3f2f1] dark:bg-zinc-800/80">
                    {/* Top-Left Empty Cell */}
                    <th className="w-10 border-r border-b border-slate-300 dark:border-zinc-700 bg-[#e1dfdd] dark:bg-zinc-800 px-1 py-1 select-none"></th>

                    {/* Column A Letter */}
                    <th
                      className={cn(
                        'border-r border-b border-slate-300 dark:border-zinc-700 px-3 py-1 text-center text-[10px] font-semibold text-slate-500 dark:text-zinc-400 select-none font-mono transition-colors',
                        activeCell.colLetter === 'A'
                          ? 'bg-[#cbd5e1] dark:bg-zinc-700 text-[#107c41] dark:text-emerald-400 font-bold'
                          : 'bg-[#f3f2f1] dark:bg-zinc-800/80'
                      )}
                    >
                      A
                    </th>

                    {/* Column letters B, C... for data headers */}
                    {sampleData.headers.map((_, idx) => {
                      const colLetter = getExcelColumnLetter(idx + 1); // B is index 1
                      const isActive = activeCell.colLetter === colLetter;
                      return (
                        <th
                          key={idx}
                          className={cn(
                            'border-r border-b border-slate-300 dark:border-zinc-700 px-3 py-1 text-center text-[10px] font-semibold text-slate-500 dark:text-zinc-400 select-none font-mono transition-colors',
                            isActive
                              ? 'bg-[#cbd5e1] dark:bg-zinc-700 text-[#107c41] dark:text-emerald-400 font-bold'
                              : 'bg-[#f3f2f1] dark:bg-zinc-800/80'
                          )}
                        >
                          {colLetter}
                        </th>
                      );
                    })}

                    {/* Column letter for Note column */}
                    {(() => {
                      const noteColLetter = getExcelColumnLetter(sampleData.headers.length + 1);
                      const isActive = activeCell.colLetter === noteColLetter;
                      return (
                        <th
                          className={cn(
                            'border-r border-b border-slate-300 dark:border-zinc-700 px-3 py-1 text-center text-[10px] font-semibold text-slate-500 dark:text-zinc-400 select-none font-mono transition-colors',
                            isActive
                              ? 'bg-[#cbd5e1] dark:bg-zinc-700 text-[#107c41] dark:text-emerald-400 font-bold'
                              : 'bg-[#f3f2f1] dark:bg-zinc-800/80'
                          )}
                        >
                          {noteColLetter}
                        </th>
                      );
                    })()}
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Header Titles */}
                  <tr className="bg-white dark:bg-zinc-950">
                    <td
                      className={cn(
                        'bg-[#f3f2f1] dark:bg-zinc-800/80 border-r border-b border-slate-300 dark:border-zinc-700 px-1 py-1 text-center text-[10px] font-semibold text-slate-500 dark:text-zinc-400 select-none transition-colors',
                        activeCell.rowNum === 1
                          ? 'bg-[#cbd5e1] dark:bg-zinc-700 text-[#107c41] dark:text-emerald-400 font-bold'
                          : ''
                      )}
                    >
                      1
                    </td>

                    {/* Status Column Header */}
                    {(() => {
                      const isSelected = activeCell.rowNum === 1 && activeCell.colLetter === 'A';
                      const cellVal = 'Trạng thái';
                      return (
                        <td
                          onClick={() =>
                            setSelectedCell({ rowNum: 1, colLetter: 'A', value: cellVal })
                          }
                          className={cn(
                            'px-3 py-1.5 border-r border-b border-slate-200 dark:border-zinc-800 whitespace-nowrap text-left font-bold text-slate-700 dark:text-zinc-200 bg-slate-50/50 dark:bg-zinc-900/40 cursor-pointer relative',
                            isSelected &&
                              'outline outline-2 outline-[#107c41] dark:outline-emerald-500 -outline-offset-1 z-10 bg-slate-100 dark:bg-zinc-800'
                          )}
                        >
                          {cellVal}
                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#107c41] dark:bg-emerald-500 border border-white z-20 pointer-events-none" />
                          )}
                        </td>
                      );
                    })()}

                    {/* Data Headers */}
                    {sampleData.headers.map((header, idx) => {
                      const colLetter = getExcelColumnLetter(idx + 1);
                      const isSelected =
                        activeCell.rowNum === 1 && activeCell.colLetter === colLetter;
                      return (
                        <td
                          key={header}
                          onClick={() => setSelectedCell({ rowNum: 1, colLetter, value: header })}
                          className={cn(
                            'px-3 py-1.5 border-r border-b border-slate-200 dark:border-zinc-800 whitespace-nowrap text-left font-bold text-slate-700 dark:text-zinc-200 bg-slate-50/50 dark:bg-zinc-900/40 cursor-pointer relative',
                            isSelected &&
                              'outline outline-2 outline-[#107c41] dark:outline-emerald-500 -outline-offset-1 z-10 bg-slate-100 dark:bg-zinc-800'
                          )}
                        >
                          {header}
                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#107c41] dark:bg-emerald-500 border border-white z-20 pointer-events-none" />
                          )}
                        </td>
                      );
                    })}

                    {/* Note Column Header */}
                    {(() => {
                      const noteColLetter = getExcelColumnLetter(sampleData.headers.length + 1);
                      const isSelected =
                        activeCell.rowNum === 1 && activeCell.colLetter === noteColLetter;
                      const cellVal = 'Ghi chú / Lỗi';
                      return (
                        <td
                          onClick={() =>
                            setSelectedCell({ rowNum: 1, colLetter: noteColLetter, value: cellVal })
                          }
                          className={cn(
                            'px-3 py-1.5 border-r border-b border-slate-200 dark:border-zinc-800 whitespace-nowrap text-left font-bold text-slate-700 dark:text-zinc-200 bg-slate-50/50 dark:bg-zinc-900/40 cursor-pointer relative',
                            isSelected &&
                              'outline outline-2 outline-[#107c41] dark:outline-emerald-500 -outline-offset-1 z-10 bg-slate-100 dark:bg-zinc-800'
                          )}
                        >
                          {cellVal}
                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#107c41] dark:bg-emerald-500 border border-white z-20 pointer-events-none" />
                          )}
                        </td>
                      );
                    })()}
                  </tr>

                  {/* Rows 2 to 9: Data Rows */}
                  {sampleData.rows.map((row, index) => {
                    const rowNum = index + 2;
                    const isValid = row.status === 'valid';
                    return (
                      <tr
                        key={index}
                        className={cn(
                          'bg-white dark:bg-zinc-950 transition-colors',
                          isValid
                            ? 'hover:bg-emerald-500/[0.01] dark:hover:bg-emerald-950/5'
                            : 'hover:bg-rose-500/[0.01] dark:hover:bg-rose-950/5'
                        )}
                      >
                        {/* Row Index cell */}
                        <td
                          className={cn(
                            'bg-[#f3f2f1] dark:bg-zinc-800/80 border-r border-b border-slate-300 dark:border-zinc-700 px-1 py-1 text-center text-[10px] font-semibold text-slate-500 dark:text-zinc-400 select-none transition-colors',
                            activeCell.rowNum === rowNum
                              ? 'bg-[#cbd5e1] dark:bg-zinc-700 text-[#107c41] dark:text-emerald-400 font-bold'
                              : ''
                          )}
                        >
                          {rowNum}
                        </td>

                        {/* Col A: Status cell */}
                        {(() => {
                          const isSelected =
                            activeCell.rowNum === rowNum && activeCell.colLetter === 'A';
                          const cellVal = isValid ? 'Hợp lệ' : 'Lỗi';
                          return (
                            <td
                              onClick={() =>
                                setSelectedCell({ rowNum, colLetter: 'A', value: cellVal })
                              }
                              className={cn(
                                'px-3 py-1.5 border-r border-b border-slate-200 dark:border-zinc-800 whitespace-nowrap text-center cursor-pointer relative',
                                isSelected &&
                                  'outline outline-2 outline-[#107c41] dark:outline-emerald-500 -outline-offset-1 z-10 bg-slate-50 dark:bg-zinc-900'
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-medium border select-none',
                                  isValid
                                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400'
                                )}
                              >
                                {cellVal}
                              </span>
                              {isSelected && (
                                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#107c41] dark:bg-emerald-500 border border-white z-20 pointer-events-none" />
                              )}
                            </td>
                          );
                        })()}

                        {/* Columns B, C... Data fields */}
                        {sampleData.headers.map((header, colIdx) => {
                          const colLetter = getExcelColumnLetter(colIdx + 1);
                          const isSelected =
                            activeCell.rowNum === rowNum && activeCell.colLetter === colLetter;
                          const cellVal = row.data[header];
                          const isNumeric =
                            typeof cellVal === 'number' ||
                            (typeof cellVal === 'string' && /^-?\d+(\.\d+)?$/.test(cellVal));
                          const displayVal = cellVal !== undefined ? String(cellVal) : '';
                          const isEmptyError = !isValid && !cellVal;

                          return (
                            <td
                              key={header}
                              onClick={() =>
                                setSelectedCell({ rowNum, colLetter, value: displayVal })
                              }
                              className={cn(
                                'px-3 py-1.5 border-r border-b border-slate-200 dark:border-zinc-800 whitespace-nowrap cursor-pointer relative transition-colors',
                                isNumeric ? 'text-right' : 'text-left',
                                isSelected
                                  ? 'outline outline-2 outline-[#107c41] dark:outline-emerald-500 -outline-offset-1 z-10 bg-slate-50 dark:bg-zinc-900'
                                  : '',
                                isEmptyError &&
                                  'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold'
                              )}
                            >
                              {displayVal}
                              {isSelected && (
                                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#107c41] dark:bg-emerald-500 border border-white z-20 pointer-events-none" />
                              )}
                            </td>
                          );
                        })}

                        {/* Last column: Note cell */}
                        {(() => {
                          const noteColLetter = getExcelColumnLetter(sampleData.headers.length + 1);
                          const isSelected =
                            activeCell.rowNum === rowNum && activeCell.colLetter === noteColLetter;
                          const cellVal = row.note;
                          return (
                            <td
                              onClick={() =>
                                setSelectedCell({
                                  rowNum,
                                  colLetter: noteColLetter,
                                  value: cellVal,
                                })
                              }
                              className={cn(
                                'px-3 py-1.5 border-r border-b border-slate-200 dark:border-zinc-800 text-left whitespace-nowrap cursor-pointer relative text-[10px] transition-colors',
                                isValid
                                  ? 'text-muted-foreground'
                                  : 'text-rose-600 dark:text-rose-400 font-medium',
                                isSelected &&
                                  'outline outline-2 outline-[#107c41] dark:outline-emerald-500 -outline-offset-1 z-10 bg-slate-50 dark:bg-zinc-900'
                              )}
                            >
                              {cellVal}
                              {isSelected && (
                                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#107c41] dark:bg-emerald-500 border border-white z-20 pointer-events-none" />
                              )}
                            </td>
                          );
                        })()}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 6. Sheet selection tabs and status bar at bottom */}
            <div className="h-8 bg-[#f3f2f1] dark:bg-zinc-900 border-t border-slate-300 dark:border-zinc-800 flex items-center justify-between text-[11px] px-3 select-none text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-800 rounded cursor-default font-bold text-[9px]">
                  ◄
                </span>
                <span className="w-4 h-4 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-800 rounded cursor-default font-bold text-[9px]">
                  ►
                </span>
                <div className="flex items-center bg-white dark:bg-zinc-950 border-x border-slate-300 dark:border-zinc-800 px-3 py-1 text-[#107c41] dark:text-emerald-500 font-semibold text-[10.5px] h-8 relative -top-[1.5px] border-b-2 border-b-[#107c41] dark:border-b-emerald-500 select-none">
                  {title.toLowerCase().includes('sản phẩm')
                    ? 'Products_Data'
                    : title.toLowerCase().includes('doanh số')
                      ? 'Sales_Report'
                      : 'Inventory_Status'}
                </div>
                <span className="w-4.5 h-4.5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-800 rounded cursor-pointer font-bold text-xs ml-1 select-none">
                  +
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Sẵn sàng
                </span>
                <span className="text-slate-300 dark:text-zinc-850">|</span>
                <span>Thu phóng: 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload States UI */}
      <UploadStatus state={uploadState} onReset={resetUpload} />

      {/* Format Warning Modal Popup */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Nhầm mục nhập dữ liệu Excel!"
        variant="warning"
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-start gap-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/80 dark:text-zinc-350">
              {formatWarning?.detectedType === 'unknown' ? (
                <p className="leading-relaxed">
                  Tệp Excel bạn vừa chọn có cấu trúc tiêu đề cột không khớp với bất kỳ cột nào của
                  cấu trúc mẫu này. Vui lòng tải về file mẫu và điền thông tin chính xác.
                </p>
              ) : (
                <p className="leading-relaxed">
                  Hệ thống phát hiện tệp tin này thuộc cấu trúc của mục{' '}
                  <strong className="text-foreground font-bold">
                    {formatWarning ? typeNames[formatWarning.detectedType] : ''}
                  </strong>
                  , nhưng bạn đang cố tải lên tại mục{' '}
                  <strong className="text-foreground font-bold">
                    {formatWarning ? typeNames[formatWarning.expectedType] : ''}
                  </strong>
                  .
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Vui lòng chọn đúng tệp Excel mẫu tương ứng hoặc kéo xuống đúng thẻ nhập bên dưới.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-3 border-t border-border/50 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                resetUpload();
                setShowWarningModal(false);
              }}
              className="rounded-xl px-4 cursor-pointer text-rose-600 hover:text-rose-700 hover:bg-rose-500/5 dark:border-zinc-800"
            >
              Chọn lại tệp khác
            </Button>
            <Button
              onClick={() => setShowWarningModal(false)}
              className="rounded-xl px-4 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white font-medium"
            >
              Đã hiểu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Format Validation Preview Modal Popup */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Kiểm tra & Xác nhận dữ liệu Excel"
        variant={
          validationResults && validationResults.invalidRowsCount > 0 ? 'warning' : 'success'
        }
        size="4xl"
      >
        <div className="flex flex-col gap-5 py-2">
          {validationResults && (
            <>
              {/* Summary Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold select-none">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <div className="text-muted-foreground text-[10px] uppercase tracking-wide">
                    Tổng số dòng
                  </div>
                  <div className="text-foreground text-sm font-bold mt-0.5">
                    {validationResults.total}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <div className="text-[10px] uppercase tracking-wide opacity-90">
                    Hợp lệ (Sẽ nhập)
                  </div>
                  <div className="text-sm font-bold mt-0.5">
                    +{validationResults.validRowsCount}
                  </div>
                </div>
                <div
                  className={cn(
                    'p-2.5 rounded-xl border transition-colors',
                    validationResults.invalidRowsCount > 0
                      ? 'bg-rose-500/5 dark:bg-rose-950/10 border-rose-500/20 text-rose-600 dark:text-rose-455'
                      : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-muted-foreground'
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wide opacity-90">
                    Hàng lỗi (Bỏ qua)
                  </div>
                  <div className="text-sm font-bold mt-0.5">
                    {validationResults.invalidRowsCount}
                  </div>
                </div>
              </div>

              {/* Data Preview Spreadsheet Section */}
              {previewData && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 select-none uppercase tracking-wide">
                    Xem trước dữ liệu tệp Excel tải lên (Tối đa 5 dòng):
                  </span>
                  <div className="overflow-x-auto border border-slate-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 max-h-[190px] overflow-y-auto">
                    <table className="w-full border-collapse text-[11px] font-sans min-w-[700px] border-spacing-0">
                      <thead>
                        <tr className="bg-[#f3f2f1] dark:bg-zinc-900 border-b border-slate-300 dark:border-zinc-800 sticky top-0 z-10">
                          <th className="w-10 border-r border-slate-300 dark:border-zinc-800 px-1 py-1.5 text-center font-mono font-semibold text-slate-500 bg-[#f3f2f1] dark:bg-zinc-900 select-none"></th>
                          <th className="border-r border-slate-300 dark:border-zinc-800 px-3 py-1.5 text-left font-semibold text-[#323130] dark:text-zinc-300 bg-[#f3f2f1] dark:bg-zinc-900 select-none">
                            Trạng thái
                          </th>
                          {previewData.headers.map((header) => (
                            <th
                              key={header}
                              className="border-r border-slate-300 dark:border-zinc-800 px-3 py-1.5 text-left font-semibold text-[#323130] dark:text-zinc-300 bg-[#f3f2f1] dark:bg-zinc-900 select-none"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.rows.map((row, index) => {
                          const excelRowNum = index + 2; // Data rows start at 2
                          const invalidRow = validationResults.invalidRows.find(
                            (ir) => ir.rowNum === excelRowNum
                          );
                          const isValid = !invalidRow;

                          return (
                            <tr
                              key={index}
                              className={cn(
                                'border-b border-slate-200 dark:border-zinc-900 last:border-0',
                                isValid
                                  ? 'bg-emerald-500/[0.01] hover:bg-emerald-500/[0.03] dark:bg-emerald-950/5'
                                  : 'bg-rose-500/[0.01] hover:bg-rose-500/[0.03] dark:bg-rose-950/5'
                              )}
                            >
                              <td className="bg-[#f3f2f1] dark:bg-zinc-900 border-r border-slate-300 dark:border-zinc-800 px-1 py-1.5 text-center font-mono font-semibold text-slate-500 select-none">
                                {excelRowNum}
                              </td>
                              <td className="px-3 py-1.5 border-r border-slate-200 dark:border-zinc-900 whitespace-nowrap text-center">
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded px-1.5 py-0.5 text-[8.5px] font-medium border select-none',
                                    isValid
                                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400'
                                      : 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400'
                                  )}
                                >
                                  {isValid ? 'Hợp lệ' : 'Dòng lỗi'}
                                </span>
                              </td>
                              {previewData.headers.map((header) => {
                                const cellVal = row[header];
                                const isNumeric =
                                  typeof cellVal === 'number' ||
                                  (typeof cellVal === 'string' && /^-?\d+(\.\d+)?$/.test(cellVal));
                                const hasError =
                                  invalidRow &&
                                  invalidRow.errors.some((err) =>
                                    err.toLowerCase().includes(header.toLowerCase())
                                  );

                                return (
                                  <td
                                    key={header}
                                    className={cn(
                                      'px-3 py-1.5 border-r border-slate-200 dark:border-zinc-900 whitespace-nowrap',
                                      isNumeric ? 'text-right' : 'text-left',
                                      hasError &&
                                        'bg-rose-50 dark:bg-rose-950/20 text-rose-750 dark:text-rose-300 font-bold'
                                    )}
                                  >
                                    {cellVal !== undefined ? String(cellVal) : ''}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invalid Rows Scrollable List */}
              {validationResults.invalidRowsCount > 0 ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 select-none uppercase tracking-wide">
                    Chi tiết các dòng không hợp lệ ({validationResults.invalidRowsCount}):
                  </span>
                  <div className="max-h-[140px] overflow-y-auto border border-rose-500/20 bg-rose-500/[0.01] dark:bg-rose-950/5 rounded-xl p-3 flex flex-col gap-2.5 font-mono text-[11px] text-rose-600 dark:text-rose-400">
                    {validationResults.invalidRows.map((errRow, idx) => (
                      <div
                        key={idx}
                        className="border-b border-rose-500/10 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="font-bold text-foreground dark:text-zinc-200">
                          Dòng {errRow.rowNum}:
                        </span>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 opacity-90 text-[10.5px]">
                          {errRow.errors.map((err, eIdx) => (
                            <li key={eIdx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {validationResults.validRowsCount === 0 ? (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1 text-center animate-pulse">
                      Cảnh báo: Toàn bộ dòng trong file đều bị lỗi. Không thể thực hiện tải lên!
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-muted-foreground mt-1 leading-relaxed">
                      Bạn có thể chọn <strong>"Chấp nhận bỏ dòng lỗi"</strong> để hệ thống tự động
                      lọc bỏ {validationResults.invalidRowsCount} dòng lỗi và chỉ tải lên{' '}
                      {validationResults.validRowsCount} dòng dữ liệu hợp lệ.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 py-3 justify-center font-semibold text-sm select-none">
                  <CheckCircle2 className="h-5 w-5 animate-bounce" />
                  <span>Chúc mừng! Toàn bộ tệp Excel hợp lệ 100%.</span>
                </div>
              )}
            </>
          )}

          {/* Action options */}
          <div className="flex justify-end gap-2.5 mt-3 border-t border-border/50 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowValidationModal(false)}
              className="rounded-xl px-4 cursor-pointer text-slate-700 dark:text-zinc-300 dark:border-zinc-800"
            >
              Hủy bỏ (Không tải lên)
            </Button>
            {validationResults && validationResults.validRowsCount > 0 ? (
              <Button
                onClick={() => handleConfirmUpload(validationResults.invalidRowsCount > 0)}
                className={cn(
                  'rounded-xl px-4 cursor-pointer text-white font-medium',
                  validationResults.invalidRowsCount > 0
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {validationResults.invalidRowsCount > 0
                  ? 'Chấp nhận bỏ dòng lỗi'
                  : 'Tiến hành nhập dữ liệu'}
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>
    </Card>
  );
}
