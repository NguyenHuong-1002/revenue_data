# 📋 Data Import Templates

Bộ 3 file Excel mẫu dùng cho chức năng **Import dữ liệu** của hệ thống. Mỗi file chứa **20 dòng dữ liệu** gồm **14 dòng hợp lệ** + **6 dòng cố tình không hợp lệ** (để test khả năng xử lý lỗi của backend).

## 📁 Danh sách file

| File | Entity | Số cột | Mô tả |
|------|--------|--------|-------|
| `products-template.xlsx` | `product` | 27 | Danh mục sản phẩm (giày, dép, phụ kiện) |
| `sale-report-template.xlsx` | `sale-report` | 12 | Báo cáo bán hàng theo tháng |
| `inventory-report-template.xlsx` | `inventory-report` | 8 | Báo cáo tồn kho theo nhà máy |

> Cột cuối cùng `_note` chỉ là **ghi chú cho người đọc**, backend sẽ bỏ qua cột này vì nó không nằm trong `REQUIRED_FIELDS`.

---

## 🔍 Cấu trúc từng file

### 1. `products-template.xlsx`

**Header (27 cột):**
```
index, color, color_group, listing_price, price_group, gender,
product_group, detail_product_group, shoe_product, size_group, size,
age_group, activity_group, image_copyright, lifestyle_group,
launch_season, mold_code, heel_height, code_lock, option,
cost_price, product_id, product_syle_color, product_syle,
brand_name, vendor_name, _note
```

**Trường bắt buộc (REQUIRED) — 10 cột:**
- `product_id`, `color`, `listing_price`, `cost_price`, `gender`,
- `detail_product_group`, `size`, `age_group`, `activity_group`, `lifestyle_group`

**ENUM values (phải khớp chính xác):**

| Trường | Giá trị hợp lệ |
|--------|----------------|
| `gender` | `MEN`, `WOM`, `BOY`, `GIR` |
| `detail_product_group` | `SANTD`, `DEPTD`, `GTTPC`, `GTTCD`, `SANTR`, `GIATR`, `PKIEN`, `TBLTH`, `TBLTR` |
| `age_group` | `0 đến <3 tuổi`, `3 đến <6 tuổi`, `6 đến <10 tuổi`, `10 đến <16 tuổi`, `16 đến <24 tuổi`, `24 đến <40 tuổi`, `40 đến <60 tuổi`, `Trên 60 tuổi`, `Khác` |
| `activity_group` | `Thường nhật/Trường học`, `Thể thao`, `Văn phòng`, `Chuyên biệt`, `Khác` |
| `lifestyle_group` | `Sport`, `Casual`, `Fashion`, `Formal`, `Khác` |

---

### 2. `sale-report-template.xlsx`

**Header (12 cột):**
```
month, week, site, branch_id, channel_id, distribution_channel,
distribution_channel_code, sold_quantity, cost_price, net_price,
customer_id, product_id, _note
```

**Trường bắt buộc — 5 cột:**
- `product_id`, `sold_quantity`, `distribution_channel`, `branch_id`, `month`

**ENUM values:**

| Trường | Giá trị hợp lệ |
|--------|----------------|
| `distribution_channel` | `Online`, `Bán lẻ`, `Phát sinh`, `Bán sỉ`, `Siêu thị`, `Hợp đồng`, `Chi nhánh` |

**Định dạng đặc biệt:**
- `month`: `YYYY0MM` (7 ký tự) — ví dụ: `2022001` cho tháng 1/2022, `2022012` cho tháng 12/2022
- `product_id`: phải tồn tại trong bảng `product` (khóa ngoại)
- `branch_id`: phải tồn tại trong bảng `storeBranch` (sẽ tự động tạo nếu chưa có)

---

### 3. `inventory-report-template.xlsx`

**Header (8 cột):**
```
index, plant, calendar_year, calendar_yeer_week, sloc,
quantity, total_amount, product_id, _note
```

**Trường bắt buộc — 4 cột:**
- `product_id`, `plant`, `calendar_yeer_week` *(hoặc `calendar_year_week`)*, `quantity`

**Định dạng đặc biệt:**
- `calendar_yeer_week`: `YYYYMMDD` (8 chữ số) — ví dụ: `20220115` cho 15/01/2022
  - Lưu ý: header gốc trong data có typo là `calendar_yeer_week` (thiếu chữ `a`). Backend chấp nhận cả 2 dạng.
- `plant`: mã nhà máy (phải tồn tại trong bảng `Plant`, sẽ tự tạo nếu chưa có)
- `product_id`: phải tồn tại trong bảng `product`

---

## ⚠️ Validation Rules (do backend áp dụng)

### `safeString` / `isValidProductString`
- **BỊ LOẠI** nếu: `null`, `undefined`, `""`, chuỗi rỗng, `"n/a"`, `"na"`, `"null"`, `"undefined"`

### `safeNumber`
- **BỊ LOẠI** nếu: `null`, `undefined`, `""`, chuỗi rỗng, `"abc"` (NaN)
- **CHẤP NHẬN** nếu: số nguyên, số thập phân, `0`, số âm

### Quy tắc "đủ trường hợp lệ"
- **Product**: tất cả 10 trường REQUIRED phải `accepted` (≥ 10) mới được insert
- **Sale report**: bất kỳ trường REQUIRED nào thiếu → cả dòng bị skip
- **Inventory report**: bất kỳ trường REQUIRED nào thiếu → cả dòng bị skip

### Khóa ngoại (FK)
- Sale/Inventory yêu cầu `product_id` phải tồn tại trong bảng `product` TRƯỚC khi import
- Sale yêu cầu `branch_id` phải tồn tại trong bảng `storeBranch` (auto-create nếu thiếu)
- Inventory yêu cầu `plant` phải tồn tại trong bảng `Plant` (auto-create nếu thiếu)

---

## 🧪 Kịch bản kiểm thử trong từng file

### Products (14 valid + 6 invalid)
| # | Dòng | Kịch bản |
|---|------|----------|
| 2-15 | Valid | Đầy đủ 10 trường REQUIRED, ENUM đúng |
| 16 | Invalid | Thiếu `product_id` |
| 17 | Invalid | `gender = "MALE"` (sai ENUM) |
| 18 | Invalid | `listing_price = "abc"` (không phải số) |
| 19 | Invalid | `color = "n/a"` (bị safeString loại) |
| 20 | Invalid | `age_group = "Trên 100 tuổi"` (không có trong ENUM) |
| 21 | Invalid | `product_id` trùng với dòng 1 (PK conflict) |

### Sale Reports (14 valid + 6 invalid)
| # | Dòng | Kịch bản |
|---|------|----------|
| 2-15 | Valid | Đầy đủ 5 trường, ENUM đúng, `month` đúng format |
| 16 | Invalid | `product_id` không tồn tại trong DB |
| 17 | Invalid | `distribution_channel = "Unknown Channel"` |
| 18 | Invalid | Thiếu `branch_id` |
| 19 | Invalid | `sold_quantity = "abc"` |
| 20 | Invalid | `month = "2022"` (chỉ 4 ký tự, sai format) |
| 21 | ⚠ Edge | `sold_quantity = -5` (âm — kỹ thuật OK, có thể cảnh báo logic) |

### Inventory Reports (14 valid + 6 invalid)
| # | Dòng | Kịch bản |
|---|------|----------|
| 2-15 | Valid | Đầy đủ 4 trường, `calendar_yeer_week` đúng format |
| 16 | Invalid | Thiếu `product_id` |
| 17 | Invalid | Thiếu `plant` |
| 18 | Invalid | `calendar_yeer_week = "not-a-date"` |
| 19 | Invalid | `quantity = "n/a"` |
| 20 | Invalid | `product_id` không tồn tại (FK) |
| 21 | ⚠ Edge | `quantity = 0` (boundary case) |

---

## 🛠️ Tự sinh lại templates

Nếu cần regenerate (ví dụ: thay đổi ENUM, thêm dòng mẫu):

```bash
node scripts/generate-templates.mjs
```

Script sẽ ghi đè 3 file trong thư mục `templates/`.

**Verify lại sau khi sinh:**
```bash
node scripts/verify-with-exceljs.mjs
```

Script dùng cùng `exceljs` reader như backend để chắc chắn file Excel tương thích.

---

## 📝 Lưu ý khi dùng template

1. **Cột `_note`**: Có thể xóa trước khi upload lên hệ thống — backend sẽ bỏ qua cột không có trong `REQUIRED_FIELDS`.
2. **Cột dư (extra columns)**: Backend Excel reader chỉ đọc các cột có giá trị ở header row 1, cột thừa sẽ bị bỏ qua. An toàn để giữ lại.
3. **Import tuần tự**: Phải import **product trước**, sau đó mới đến **sale-report** và **inventory-report** (vì cả 2 đều có FK tới `product`).
4. **Trùng PK**: Hệ thống dùng `INSERT IGNORE` / `ON DUPLICATE KEY UPDATE` — dòng trùng `product_id` sẽ tự động skip hoặc update.
