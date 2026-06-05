// ─────────────────────────────────────────────────
//  Cleaned Entity Types
// ─────────────────────────────────────────────────

export interface CleanedProduct {
  product_id: string;
  color: string;
  listing_price: number;
  price_cost: number;
  gender: string;
  detail_product_group: string;
  size: number;
  age_group: string;
  activity_group: string;
  lifestyle_group: string;
}

export interface CleanedSaleReport {
  sale_id: string;
  product_id: string;
  sold_quantity: number;
  distribution_channel: string;
  branch_id: string;
  time_report: string;
}

export interface CleanedInventoryReport {
  inventory_id: string;
  product_id: string;
  plant_id: string;
  calendar_year_week: string | null;
  quantity: number | null;
}

// ─────────────────────────────────────────────────
//  Transform Result - kết quả sau khi transform một dòng
//  Ghi lại những trường nào được chấp nhận / bị loại
// ─────────────────────────────────────────────────

export interface TransformResult<T> {
  /** Dữ liệu đã được chuyển đổi và chuẩn hóa */
  data: T;
  /** Danh sách tên trường có giá trị hợp lệ */
  acceptedFields: string[];
  /** Danh sách tên trường bị loại (null/undefined/na/rác) */
  rejectedFields: string[];
  /** Chi tiết lỗi cho từng trường bị loại */
  errorDetails?: Record<string, string>;
}

// ─────────────────────────────────────────────────
//  Field Stats - thống kê accept/reject cho mỗi trường
//  trong toàn bộ import của một entity
// ─────────────────────────────────────────────────

export interface FieldStat {
  accepted: number;
  rejected: number;
}

export type FieldStats = Record<string, FieldStat>;

// ─────────────────────────────────────────────────
//  Import Result - kết quả trả về từ mỗi import method
// ─────────────────────────────────────────────────

export interface ImportResult {
  /** Tổng số dòng đọc được từ Excel */
  total: number;
  /** Số dòng được insert thành công vào DB */
  inserted: number;
  /** Số dòng bị bỏ qua (do thiếu trường critical) */
  skipped: number;
  /** Thống kê chi tiết theo từng trường: accepted/rejected */
  fieldStats: FieldStats;
}
