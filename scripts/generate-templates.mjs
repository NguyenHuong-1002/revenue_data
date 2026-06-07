/**
 * generate-templates.mjs
 *
 * Sinh 3 file Excel mẫu (products, sale-report, inventory-report) trong thư mục templates/.
 * Mỗi file chứa:
 *   - Hàng tiêu đề đúng thứ tự cột như file dữ liệu gốc.
 *   - 20 dòng dữ liệu: 14 hợp lệ + 6 không hợp lệ (kèm chú thích cột "_note").
 *
 * Chạy: `node scripts/generate-templates.mjs`
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
// xlsx chỉ có trong frontend/node_modules — dùng createRequire để resolve
const XLSX = require(path.resolve(__dirname, '..', 'frontend', 'node_modules', 'xlsx'));

const OUT_DIR = path.resolve(__dirname, '..', 'templates');
mkdirSync(OUT_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────
//  ENUM values (khớp với init.sql)
// ─────────────────────────────────────────────────────────────
const GENDERS = ['MEN', 'WOM', 'BOY', 'GIR'];
const DETAIL_PRODUCT_GROUPS = [
  'SANTD', 'DEPTD', 'GTTPC', 'GTTCD', 'SANTR',
  'GIATR', 'PKIEN', 'TBLTH', 'TBLTR',
];
const AGE_GROUPS = [
  '0 đến <3 tuổi', '3 đến <6 tuổi', '6 đến <10 tuổi', '10 đến <16 tuổi',
  '16 đến <24 tuổi', '24 đến <40 tuổi', '40 đến <60 tuổi',
  'Trên 60 tuổi', 'Khác',
];
const ACTIVITY_GROUPS = [
  'Thường nhật/Trường học', 'Thể thao', 'Văn phòng', 'Chuyên biệt', 'Khác',
];
const LIFESTYLE_GROUPS = ['Sport', 'Casual', 'Fashion', 'Formal', 'Khác'];
const DISTRIBUTION_CHANNELS = [
  'Online', 'Bán lẻ', 'Phát sinh', 'Bán sỉ',
  'Siêu thị', 'Hợp đồng', 'Chi nhánh',
];

// product_id thực tế từ Productmaster.xlsx (sẽ resolve nếu có thể từ DB, fallback dùng list mẫu).
// Trong thực tế, ID có dạng "<hex32><Mã 5 ký tự>" — ví dụ: 80e1107e5bf74598baffea3a7b6073c5DEN38
const SAMPLE_PRODUCT_IDS = [
  '80e1107e5bf74598baffea3a7b6073c5DEN38',
  'a01b2c3d4e5f6789abcdef0123456789ABC12',
  'b12c3d4e5f6789abcdef0123456789abcdEFG34',
  'c23d4e5f6789abcdef0123456789abcdefHIJ56',
  'd34e5f6789abcdef0123456789abcdefghijKL78',
  'e45f6789abcdef0123456789abcdefghijklmno90',
  'f56789abcdef0123456789abcdefghijklmnopqr12',
  '06789abcdef0123456789abcdefghijklmnopqrstu34',
  '1789abcdef0123456789abcdefghijklmnopqrstuv56',
  '289abcdef0123456789abcdefghijklmnopqrstuvwx78',
  '39abcdef0123456789abcdefghijklmnopqrstuvwxyz90',
  '4abcdef0123456789abcdefghijklmnopqrstuvwxyzab12',
  '5bcdef0123456789abcdefghijklmnopqrstuvwxyzabcd34',
  '6cdef0123456789abcdefghijklmnopqrstuvwxyzabcdef56',
];

const SAMPLE_BRANCH_IDS = ['CN001', 'CN002', 'CN003', 'CN004', 'CN005', 'CN006', 'CN007'];
const SAMPLE_PLANTS = ['NM01', 'NM02', 'NM03', 'NM04', 'NM05'];

// helpers
const pick = (arr, i) => arr[i % arr.length];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─────────────────────────────────────────────────────────────
//  1. PRODUCTS TEMPLATE
// ─────────────────────────────────────────────────────────────
function buildProductRows() {
  const headers = [
    'index', 'color', 'color_group', 'listing_price', 'price_group', 'gender',
    'product_group', 'detail_product_group', 'shoe_product', 'size_group', 'size',
    'age_group', 'activity_group', 'image_copyright', 'lifestyle_group',
    'launch_season', 'mold_code', 'heel_height', 'code_lock', 'option',
    'cost_price', 'product_id', 'product_syle_color', 'product_syle',
    'brand_name', 'vendor_name', '_note',
  ];

  // 14 valid rows
  const valid = Array.from({ length: 14 }, (_, i) => ({
    index: i + 1,
    color: pick(['Đỏ', 'Xanh dương', 'Đen', 'Trắng', 'Vàng', 'Hồng', 'Xám', 'Nâu'], i),
    color_group: pick(['Màu nổi', 'Màu trung tính', 'Màu pastel'], i),
    listing_price: randInt(500000, 5000000),
    price_group: pick(['Cao cấp', 'Trung cấp', 'Phổ thông'], i),
    gender: pick(GENDERS, i),
    product_group: pick(['Giày', 'Dép', 'Phụ kiện'], i),
    detail_product_group: pick(DETAIL_PRODUCT_GROUPS, i),
    shoe_product: pick(['Sneaker', 'Boot', 'Sandal', 'Loafer'], i),
    size_group: pick(['Nhỏ', 'Vừa', 'Lớn'], i),
    size: randInt(28, 45),
    age_group: pick(AGE_GROUPS, i),
    activity_group: pick(ACTIVITY_GROUPS, i),
    image_copyright: '© 2024',
    lifestyle_group: pick(LIFESTYLE_GROUPS, i),
    launch_season: pick(['SS24', 'FW24', 'SS25', 'FW25'], i),
    mold_code: `MC${randInt(100, 999)}`,
    heel_height: randInt(0, 8),
    code_lock: 'N',
    option: pick(['A', 'B', 'C'], i),
    cost_price: randInt(300000, 3000000),
    product_id: pick(SAMPLE_PRODUCT_IDS, i),
    product_syle_color: `STYLE${randInt(100, 999)}`,
    product_syle: `STYLE${randInt(100, 999)}`,
    brand_name: pick(['Nike', 'Adidas', 'Puma', 'Reebok'], i),
    vendor_name: pick(['Vendor A', 'Vendor B', 'Vendor C'], i),
    _note: '✓ Hợp lệ',
  }));

  // 6 invalid rows — mỗi row cố tình vi phạm 1+ field
  const invalid = [
    // 1. Thiếu product_id (bắt buộc)
    {
      index: 15, color: 'Đỏ', color_group: 'Màu nổi', listing_price: 1500000,
      price_group: 'Trung cấp', gender: 'MEN', product_group: 'Giày',
      detail_product_group: 'SANTD', shoe_product: 'Sneaker', size_group: 'Vừa',
      size: 40, age_group: '24 đến <40 tuổi', activity_group: 'Thể thao',
      image_copyright: '© 2024', lifestyle_group: 'Sport', launch_season: 'SS24',
      mold_code: 'MC100', heel_height: 3, code_lock: 'N', option: 'A',
      cost_price: 800000, product_id: '', // ← thiếu
      product_syle_color: 'STYLE100', product_syle: 'STYLE100',
      brand_name: 'Nike', vendor_name: 'Vendor A',
      _note: '✗ Thiếu product_id (REQUIRED)',
    },
    // 2. Sai ENUM gender
    {
      index: 16, color: 'Xanh', color_group: 'Màu nổi', listing_price: 2000000,
      price_group: 'Cao cấp', gender: 'MALE', // ← sai
      product_group: 'Giày', detail_product_group: 'DEPTD', shoe_product: 'Boot',
      size_group: 'Vừa', size: 42, age_group: '24 đến <40 tuổi',
      activity_group: 'Thể thao', image_copyright: '© 2024', lifestyle_group: 'Sport',
      launch_season: 'FW24', mold_code: 'MC200', heel_height: 5, code_lock: 'N',
      option: 'B', cost_price: 1000000,
      product_id: SAMPLE_PRODUCT_IDS[2],
      product_syle_color: 'STYLE200', product_syle: 'STYLE200',
      brand_name: 'Adidas', vendor_name: 'Vendor B',
      _note: '✗ gender = "MALE" (phải là MEN/WOM/BOY/GIR)',
    },
    // 3. listing_price không phải số
    {
      index: 17, color: 'Đen', color_group: 'Màu trung tính', listing_price: 'abc', // ← sai
      price_group: 'Phổ thông', gender: 'WOM', product_group: 'Dép',
      detail_product_group: 'GTTPC', shoe_product: 'Sandal', size_group: 'Nhỏ',
      size: 38, age_group: '24 đến <40 tuổi', activity_group: 'Thường nhật/Trường học',
      image_copyright: '© 2024', lifestyle_group: 'Casual', launch_season: 'SS24',
      mold_code: 'MC300', heel_height: 1, code_lock: 'N', option: 'C',
      cost_price: 500000, product_id: SAMPLE_PRODUCT_IDS[3],
      product_syle_color: 'STYLE300', product_syle: 'STYLE300',
      brand_name: 'Puma', vendor_name: 'Vendor C',
      _note: '✗ listing_price = "abc" (phải là số)',
    },
    // 4. color = 'n/a' (giá trị rác)
    {
      index: 18, color: 'n/a', // ← rác
      color_group: 'Màu trung tính', listing_price: 1000000,
      price_group: 'Phổ thông', gender: 'BOY', product_group: 'Giày',
      detail_product_group: 'TBLTH', shoe_product: 'Sneaker', size_group: 'Vừa',
      size: 35, age_group: '6 đến <10 tuổi', activity_group: 'Thể thao',
      image_copyright: '© 2024', lifestyle_group: 'Sport', launch_season: 'SS24',
      mold_code: 'MC400', heel_height: 2, code_lock: 'N', option: 'A',
      cost_price: 600000, product_id: SAMPLE_PRODUCT_IDS[4],
      product_syle_color: 'STYLE400', product_syle: 'STYLE400',
      brand_name: 'Nike', vendor_name: 'Vendor A',
      _note: '✗ color = "n/a" (bị safeString loại)',
    },
    // 5. age_group không có trong ENUM
    {
      index: 19, color: 'Vàng', color_group: 'Màu nổi', listing_price: 1800000,
      price_group: 'Trung cấp', gender: 'GIR', product_group: 'Giày',
      detail_product_group: 'PKIEN', shoe_product: 'Sneaker', size_group: 'Nhỏ',
      size: 32, age_group: 'Trên 100 tuổi', // ← sai
      activity_group: 'Văn phòng', image_copyright: '© 2024', lifestyle_group: 'Fashion',
      launch_season: 'FW24', mold_code: 'MC500', heel_height: 3, code_lock: 'N',
      option: 'B', cost_price: 900000, product_id: SAMPLE_PRODUCT_IDS[5],
      product_syle_color: 'STYLE500', product_syle: 'STYLE500',
      brand_name: 'Adidas', vendor_name: 'Vendor B',
      _note: '✗ age_group = "Trên 100 tuổi" (không có trong ENUM)',
    },
    // 6. product_id trùng với dòng hợp lệ ở trên (sẽ bị INSERT IGNORE skip)
    {
      index: 20, color: 'Hồng', color_group: 'Màu pastel', listing_price: 2500000,
      price_group: 'Cao cấp', gender: 'WOM', product_group: 'Giày',
      detail_product_group: 'GIATR', shoe_product: 'Boot', size_group: 'Vừa',
      size: 39, age_group: '24 đến <40 tuổi', activity_group: 'Thời trang',
      image_copyright: '© 2024', lifestyle_group: 'Fashion', launch_season: 'SS25',
      mold_code: 'MC600', heel_height: 6, code_lock: 'N', option: 'C',
      cost_price: 1200000,
      product_id: SAMPLE_PRODUCT_IDS[0], // ← trùng với dòng 1
      product_syle_color: 'STYLE600', product_syle: 'STYLE600',
      brand_name: 'Nike', vendor_name: 'Vendor A',
      _note: '✗ product_id trùng với dòng 1 (PK conflict → INSERT IGNORE skip)',
    },
  ];

  return [headers, ...valid, ...invalid].map((r) =>
    Array.isArray(r) ? r : headers.map((h) => r[h] ?? ''),
  );
}

// ─────────────────────────────────────────────────────────────
//  2. SALE REPORT TEMPLATE
// ─────────────────────────────────────────────────────────────
function buildSaleReportRows() {
  const headers = [
    'month', 'week', 'site', 'branch_id', 'channel_id', 'distribution_channel',
    'distribution_channel_code', 'sold_quantity', 'cost_price', 'net_price',
    'customer_id', 'product_id', '_note',
  ];

  // 14 valid rows
  const valid = Array.from({ length: 14 }, (_, i) => ({
    month: `2022${String(randInt(1, 12)).padStart(2, '0').padStart(2, '0').slice(-1)}`.padStart(7, '0'),
    week: randInt(1, 52),
    site: pick(['HCM', 'HN', 'DN', 'CT'], i),
    branch_id: pick(SAMPLE_BRANCH_IDS, i),
    channel_id: `CH${randInt(100, 999)}`,
    distribution_channel: pick(DISTRIBUTION_CHANNELS, i),
    distribution_channel_code: `DCC${randInt(10, 99)}`,
    sold_quantity: randInt(1, 50),
    cost_price: randInt(200000, 1500000),
    net_price: randInt(400000, 3000000),
    customer_id: `CUST${randInt(10000, 99999)}`,
    product_id: pick(SAMPLE_PRODUCT_IDS, i),
    _note: '✓ Hợp lệ',
  }));

  // Fix month format: YYYY0MM (e.g., 2022011) — the validator parses position 5-7
  valid.forEach((r, i) => {
    const monthNum = ((i) % 12) + 1;
    r.month = `2022${'0'}${String(monthNum).padStart(2, '0')}`;
  });

  // 6 invalid rows
  const invalid = [
    // 1. product_id không tồn tại trong DB
    {
      month: '202201', week: 1, site: 'HCM', branch_id: 'CN001',
      channel_id: 'CH100', distribution_channel: 'Online',
      distribution_channel_code: 'DCC10', sold_quantity: 5,
      cost_price: 500000, net_price: 800000, customer_id: 'CUST11111',
      product_id: 'NONEXISTENT_PRODUCT_99999', // ← FK fail
      _note: '✗ product_id không tồn tại (FK violation)',
    },
    // 2. distribution_channel không có trong ENUM
    {
      month: '202202', week: 5, site: 'HN', branch_id: 'CN002',
      channel_id: 'CH200', distribution_channel: 'Unknown Channel', // ← sai
      distribution_channel_code: 'DCC20', sold_quantity: 10,
      cost_price: 600000, net_price: 1000000, customer_id: 'CUST22222',
      product_id: SAMPLE_PRODUCT_IDS[1],
      _note: '✗ distribution_channel = "Unknown Channel" (không có trong ENUM)',
    },
    // 3. Thiếu branch_id
    {
      month: '202203', week: 9, site: 'DN', branch_id: '', // ← thiếu
      channel_id: 'CH300', distribution_channel: 'Bán lẻ',
      distribution_channel_code: 'DCC30', sold_quantity: 3,
      cost_price: 400000, net_price: 700000, customer_id: 'CUST33333',
      product_id: SAMPLE_PRODUCT_IDS[2],
      _note: '✗ Thiếu branch_id (REQUIRED)',
    },
    // 4. sold_quantity = 'abc' (không phải số)
    {
      month: '202204', week: 14, site: 'CT', branch_id: 'CN003',
      channel_id: 'CH400', distribution_channel: 'Phát sinh',
      distribution_channel_code: 'DCC40', sold_quantity: 'abc', // ← sai
      cost_price: 300000, net_price: 500000, customer_id: 'CUST44444',
      product_id: SAMPLE_PRODUCT_IDS[3],
      _note: '✗ sold_quantity = "abc" (phải là số)',
    },
    // 5. month sai format (quá ngắn)
    {
      month: '2022', week: 18, site: 'HCM', branch_id: 'CN004',
      channel_id: 'CH500', distribution_channel: 'Siêu thị',
      distribution_channel_code: 'DCC50', sold_quantity: 7,
      cost_price: 700000, net_price: 1200000, customer_id: 'CUST55555',
      product_id: SAMPLE_PRODUCT_IDS[4],
      _note: '✗ month = "2022" (phải dạng YYYY0MM, 7 ký tự)',
    },
    // 6. sold_quantity âm
    {
      month: '202205', week: 22, site: 'HN', branch_id: 'CN005',
      channel_id: 'CH600', distribution_channel: 'Bán sỉ',
      distribution_channel_code: 'DCC60', sold_quantity: -5, // ← âm (vẫn pass number check, DB có thể nhận)
      cost_price: 800000, net_price: 1500000, customer_id: 'CUST66666',
      product_id: SAMPLE_PRODUCT_IDS[5],
      _note: '⚠ sold_quantity = -5 (âm — hợp lệ về mặt kiểu, có thể vi phạm logic kinh doanh)',
    },
  ];

  return [headers, ...valid, ...invalid].map((r) =>
    Array.isArray(r) ? r : headers.map((h) => r[h] ?? ''),
  );
}

// ─────────────────────────────────────────────────────────────
//  3. INVENTORY REPORT TEMPLATE
// ─────────────────────────────────────────────────────────────
function buildInventoryReportRows() {
  const headers = [
    'index', 'plant', 'calendar_year', 'calendar_yeer_week', 'sloc',
    'quantity', 'total_amount', 'product_id', '_note',
  ];

  // 14 valid rows
  const valid = Array.from({ length: 14 }, (_, i) => {
    const day = String(randInt(1, 28)).padStart(2, '0');
    const month = String(randInt(1, 12)).padStart(2, '0');
    return {
      index: i + 1,
      plant: pick(SAMPLE_PLANTS, i),
      calendar_year: 2022,
      calendar_yeer_week: `2022${month}${day}`, // YYYYMMDD format
      sloc: pick(['SLOC01', 'SLOC02', 'SLOC03'], i),
      quantity: randInt(10, 500),
      total_amount: randInt(1000000, 50000000),
      product_id: pick(SAMPLE_PRODUCT_IDS, i),
      _note: '✓ Hợp lệ',
    };
  });

  // 6 invalid rows
  const invalid = [
    // 1. Thiếu product_id
    {
      index: 15, plant: 'NM01', calendar_year: 2022,
      calendar_yeer_week: '20220115', sloc: 'SLOC01', quantity: 100,
      total_amount: 5000000, product_id: '',
      _note: '✗ Thiếu product_id (REQUIRED)',
    },
    // 2. Thiếu plant
    {
      index: 16, plant: '', calendar_year: 2022,
      calendar_yeer_week: '20220220', sloc: 'SLOC02', quantity: 50,
      total_amount: 3000000, product_id: SAMPLE_PRODUCT_IDS[1],
      _note: '✗ Thiếu plant (REQUIRED)',
    },
    // 3. calendar_yeer_week sai format (chữ cái)
    {
      index: 17, plant: 'NM02', calendar_year: 2022,
      calendar_yeer_week: 'not-a-date', // ← sai
      sloc: 'SLOC03', quantity: 200, total_amount: 10000000,
      product_id: SAMPLE_PRODUCT_IDS[2],
      _note: '✗ calendar_yeer_week = "not-a-date" (sai định dạng YYYYMMDD)',
    },
    // 4. quantity = 'n/a' (bị safeNumber loại)
    {
      index: 18, plant: 'NM03', calendar_year: 2022,
      calendar_yeer_week: '20220310', sloc: 'SLOC01', quantity: 'n/a',
      total_amount: 8000000, product_id: SAMPLE_PRODUCT_IDS[3],
      _note: '✗ quantity = "n/a" (bị safeNumber loại về null)',
    },
    // 5. product_id không tồn tại
    {
      index: 19, plant: 'NM04', calendar_year: 2022,
      calendar_yeer_week: '20220425', sloc: 'SLOC02', quantity: 150,
      total_amount: 7000000,
      product_id: 'GHOST_PRODUCT_FOREIGN_KEY', // ← FK fail
      _note: '✗ product_id không tồn tại trong DB (FK violation)',
    },
    // 6. quantity = 0 (boundary case — hợp lệ về kiểu nhưng có thể cảnh báo)
    {
      index: 20, plant: 'NM05', calendar_year: 2022,
      calendar_yeer_week: '20220530', sloc: 'SLOC03', quantity: 0,
      total_amount: 0, product_id: SAMPLE_PRODUCT_IDS[5],
      _note: '⚠ quantity = 0 (boundary — hợp lệ về mặt kỹ thuật)',
    },
  ];

  return [headers, ...valid, ...invalid].map((r) =>
    Array.isArray(r) ? r : headers.map((h) => r[h] ?? ''),
  );
}

// ─────────────────────────────────────────────────────────────
//  Write all 3 workbooks
// ─────────────────────────────────────────────────────────────
const targets = [
  { name: 'products-template.xlsx', rows: buildProductRows() },
  { name: 'sale-report-template.xlsx', rows: buildSaleReportRows() },
  { name: 'inventory-report-template.xlsx', rows: buildInventoryReportRows() },
];

for (const { name, rows } of targets) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  // Set column widths for readability
  ws['!cols'] = rows[0].map((h) => ({ wch: Math.max(12, String(h).length + 2) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  const outPath = path.join(OUT_DIR, name);
  XLSX.writeFile(wb, outPath);
  console.log(`✔ ${name}  (${rows.length - 1} dòng dữ liệu)  →  ${outPath}`);
}

console.log(`\n✓ Đã tạo ${targets.length} file template trong ${OUT_DIR}`);
