/* eslint-disable @typescript-eslint/no-base-to-string */
// Function check giá trị đầu vào val == null thì trả về chuỗi rỗng , còn lại ép kiểu về string
// sử dụng toán tử == <so sánh lỏng> để bắt value underfine và null
export function safeString(value: unknown): string {
  // eslint-disable-next-line eqeqeq
  return value == null ? '' : String(value);
}

// Function helps check giá trị đầu vào thành string (nếu ép kiểu khác number => trả về NaN)
export function safeNumber(value: unknown): number | null {
  // 1. Nếu là null, undefined, hoặc chuỗi rỗng (kể cả chứa toàn dấu cách) -> Trả về null
  // eslint-disable-next-line eqeqeq
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  const num = Number(value);
  // 3. Nếu ép kiểu thất bại (ra NaN, ví dụ do input là chữ "abc") -> Trả về null
  // Nếu thành công (bao gồm cả số 0 hợp lệ) -> Trả về chính số đó
  return Number.isNaN(num) ? null : num;
}

// Hàm gộp: Vừa chống crash code, vừa kiểm tra nội dung rác cho bất kỳ trường nào đầu vào từ Excel
export function isValidProductString(value: unknown): boolean {
  // 1. Chặn ngay null/undefined
  // eslint-disable-next-line eqeqeq
  if (value == null) return false;

  // 2. Ép kiểu về string và dọn dẹp khoảng trắng
  const cleaned = String(value).trim().toLowerCase();

  // 3. Kiểm tra nội dung rác
  if (!cleaned) return false;
  if (cleaned === 'n/a' || cleaned === 'na') return false;
  if (cleaned === 'null' || cleaned === 'undefined') return false;

  return true;
}

// Tự động sinh ra một chuỗi ID ngẫu nhiên không trùng lặp dựa theo tiền tố mong muốn.
export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}${rand}`;
}

// Trích xuất số tuổi từ một chuỗi văn bản (Ví dụ: Chuỗi "Từ 18 đến 25 tuổi" sẽ được rút trích ra số 18).
export function parseAgeGroup(val: string): number {
  if (!val) return 0;
  const match = String(val).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

// Định dạng lại các kiểu chuỗi ngày tháng khác nhau về một chuẩn chung của Database dạng YYYY-MM-DD HH:mm:ss.
export function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;
  if (/^\d{8}$/.test(dateStr)) {
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    return `${y}-${m}-${d} 00:00:00`;
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace('T', ' ');
}

// Chuyển đổi định dạng tháng Excel YYYY0MM (ví dụ 2022001 -> 2022-01-01 00:00:00) làm time_report
export function parseMonthToDateStr(val: unknown): string {
  const sVal = String(val == null ? '' : val).trim();
  if (sVal.length === 7) {
    const year = sVal.substring(0, 4);
    const month = sVal.substring(5, 7);
    return `${year}-${month}-01 00:00:00`;
  }
  const d = new Date(sVal);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
}

// Chuẩn hóa kênh phân phối để luôn khớp chính xác với ENUM trong Database
export function normalizeDistributionChannel(channel: string): string {
  const c = String(channel).trim().toLowerCase();
  if (c === '-' || c === '') return '';
  if (c === 'online') return 'Online';
  if (c === 'bán lẻ' || c === 'ban le') return 'Bán lẻ';
  if (c === 'phát sinh' || c === 'phat sinh') return 'Phát sinh';
  if (c === 'bán sỉ' || c === 'ban si') return 'Bán sỉ';
  if (c === 'siêu thị' || c === 'sieu thi') return 'Siêu thị';
  if (c === 'hợp đồng' || c === 'hop dong') return 'Hợp đồng';
  if (c === 'chi nhánh' || c === 'chi nhanh') return 'Chi nhánh';
  return channel;
}
