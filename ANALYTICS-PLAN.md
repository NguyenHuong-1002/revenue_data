# Kế Hoạch Nâng Cấp Hệ Thống Analytics

## Giai đoạn 1 + 2: Báo Cáo Đa Chiều + Cross-Module Intelligence
### Bổ sung: Module FastAPI xử lý dữ liệu chuyên sâu

---

## Mục Lục

1. [Hiện Trạng & Vấn Đề](#1-hiện-trạng--vấn-đề)
2. [Bước 1: NestJS Module Analytics + Revenue Đa Chiều](#2-bước-1--nestjs-module-analytics--revenue-đa-chiều)
3. [Bước 2: NestJS Inventory + Cross-module Analytics](#3-bước-2--nestjs-inventory--cross-module-analytics)
4. [Bước 3: Frontend - Service + Pages Mới](#4-bước-3--frontend---service--pages-mới)
5. [Bước 4: AI + Optimization + Testing](#5-bước-4--ai--optimization--testing)
6. [Bước 5: FastAPI Microservice - Xử Lý Dữ Liệu Chuyên Sâu](#6-bước-5--fastapi-microservice---xử-lý-dữ-liệu-chuyên-sâu)
7. [Tổng Quan Files Bị Ảnh Hưởng](#7-tổng-quan-files-bị-ảnh-hưởng)
8. [Timeline Dự Kiến](#8-timeline-dự-kiến)

---

## 1. Hiện Trạng & Vấn Đề

### ✅ Những gì hệ thống ĐANG làm tốt

| Tính năng | Module | Chi tiết |
|-----------|--------|----------|
| CRUD cơ bản | Tất cả modules | 15 entities, 80+ API endpoints |
| Import Excel | `data-processing` | Product, sales, inventory từ .xlsx |
| Top sản phẩm/chi nhánh theo doanh thu | `sale-reports` | Revenue = sold_qty * listing_price |
| Báo cáo tăng trưởng + doanh thu PDF/Excel | `reports` | PDFKit + ExcelJS, 2-4 worksheets |
| Dự báo cơ bản | `forecasting` | EMA (flat) + Linear Regression (OLS) |
| AI chat | `ai-interpretation` | Proxy tới DeepSeek/OpenRouter |

### ❌ Những gì ĐANG THIẾU

| # | Mảng | Vấn đề cụ thể |
|---|------|---------------|
| 1 | **Lợi nhuận** | Có `price_cost` nhưng **không API nào tính profit/margin** |
| 2 | **Thuộc tính sản phẩm** | Có 5 thuộc tính phân loại nhưng **không phân tích theo các chiều này** |
| 3 | **Kênh phân phối** | `distribution_channel` được import nhưng **không tổng hợp trong báo cáo** |
| 4 | **Địa lý** | Branch có `city`, `lat/lng` nhưng **không phân tích theo vùng miền** |
| 5 | **Kho hàng** | Inventory tách biệt hoàn toàn khỏi doanh thu |
| 6 | **Dự báo doanh thu** | Chỉ forecast số lượng, không forecast doanh thu |
| 7 | **Cross-analysis** | 3 entity (SP-Chi nhánh-Nhà máy) bị cô lập |
| 8 | **YoY Growth** | Chỉ MoM, không có so sánh cùng kỳ năm ngoái |
| 9 | **AI analysis** | Chỉ gửi 6 metrics, không tự động query data |
| 10 | **Xử lý nặng** | NestJS không tối ưu cho ML, thống kê phức tạp |

---

## 2. Bước 1 — NestJS Module Analytics + Revenue Đa Chiều

### 2.1 Tạo module `analytics` backend structure

**Cấu trúc module mới:**

```
backend/src/modules/analytics/
├── analytics.module.ts          # Module NestJS, inject DatabaseService
├── analytics.controller.ts      # Định tuyến, Swagger docs, auth guard
├── analytics.service.ts         # Logic truy vấn phân tích (có caching)
├── dto/
│   └── analytics-query.dto.ts   # Query params validation
├── interfaces/
│   └── analytics.interface.ts   # TypeScript types cho response
├── analytics-alert.service.ts   # Cron job cảnh báo tự động
├── analytics.service.spec.ts    # Unit test
└── analytics.controller.spec.ts # Unit test
```

**Danh sách files:**

| # | File | Hành động | Mô tả |
|---|------|-----------|-------|
| 1 | `backend/src/modules/analytics/analytics.module.ts` | 🆕 Tạo mới | Module NestJS, inject DatabaseService + ScheduleModule |
| 2 | `backend/src/modules/analytics/analytics.service.ts` | 🆕 Tạo mới | Logic truy vấn phân tích, caching layer |
| 3 | `backend/src/modules/analytics/analytics.controller.ts` | 🆕 Tạo mới | Định tuyến, Swagger docs, auth guard ADMIN |
| 4 | `backend/src/modules/analytics/dto/analytics-query.dto.ts` | 🆕 Tạo mới | `fromMonth?`, `toMonth?`, `attribute?`, `topN?` |
| 5 | `backend/src/modules/analytics/interfaces/analytics.interface.ts` | 🆕 Tạo mới | Types cho tất cả response |
| 6 | `backend/src/modules/analytics/analytics-alert.service.ts` | 🆕 Tạo mới | Cron job check stockout, excess, sales decline |
| 7 | `backend/src/app.module.ts` | ✏️ Sửa | Import `AnalyticsModule` |

**Input (query params chung):**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `fromMonth` | `string (YYYY-MM)` | ❌ | Lọc từ tháng |
| `toMonth` | `string (YYYY-MM)` | ❌ | Lọc đến tháng |
| `attribute` | `enum` | ❌ (tuỳ API) | Thuộc tính cần group by |
| `topN` | `number (1-100)` | ❌ | Số lượng top (mặc định 10) |

---

### 2.2 API: Revenue by Attribute

**Endpoint:** `GET /analytics/revenue/by-attribute`

**Chức năng:** Phân tích doanh thu, số lượng bán theo các thuộc tính sản phẩm (giới tính, nhóm tuổi, nhóm hoạt động, lối sống, nhóm sản phẩm chi tiết).

**Input riêng:**

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `attribute` | `'gender' \| 'age_group' \| 'activity_group' \| 'lifestyle_group' \| 'detail_product_group'` | ✅ | Thuộc tính cần phân tích |

**Output:**

```json
{
  "attribute": "gender",
  "fromMonth": "2023-01",
  "toMonth": "2023-12",
  "data": [
    { "label": "MEN", "revenue": 123456789, "quantity": 5000, "product_count": 45, "percentage": 35.2 },
    { "label": "WOM", "revenue": 98765432, "quantity": 4000, "product_count": 38, "percentage": 28.1 }
  ]
}
```

**Logic xử lý:**
- JOIN `saleReport` với `product` qua `product_id`
- Dynamic GROUP BY theo attribute được chọn
- Revenue = `SUM(sold_quantity * listing_price)`
- Tính phần trăm so với tổng
- LIMIT theo topN

---

### 2.3 API: Revenue by Channel

**Endpoint:** `GET /analytics/revenue/by-channel`

**Chức năng:** Phân tích doanh thu, số lượng bán, số giao dịch theo từng kênh phân phối (Online, Bán lẻ, Bán sỉ, Siêu thị, Hợp đồng, Chi nhánh, Phát sinh).

**Output:**

```json
{
  "fromMonth": "2023-01",
  "toMonth": "2023-12",
  "data": [
    { "channel": "Online", "revenue": 50000000, "quantity": 2500, "transaction_count": 800, "percentage": 40.5 },
    { "channel": "Bán lẻ", "revenue": 35000000, "quantity": 1800, "transaction_count": 600, "percentage": 28.3 }
  ]
}
```

**Logic:**
- GROUP BY `distribution_channel`
- `transaction_count` = `COUNT(DISTINCT sale_id)`
- JOIN với `product` để lấy giá

---

### 2.4 API: Revenue by Region

**Endpoint:** `GET /analytics/revenue/by-region`

**Chức năng:** Phân tích doanh thu theo thành phố và vùng miền (Bắc/Trung/Nam). Dùng hardcode mapping city → region dựa trên danh sách tỉnh thành Việt Nam.

**Output:**

```json
{
  "fromMonth": "2023-01",
  "toMonth": "2023-12",
  "regions": [
    {
      "region": "Bắc",
      "revenue": 100000000,
      "quantity": 5000,
      "percentage": 45.5,
      "cities": [
        { "city": "Hà Nội", "revenue": 60000000, "quantity": 3000 },
        { "city": "Hải Phòng", "revenue": 25000000, "quantity": 1200 }
      ]
    }
  ],
  "city_details": [
    { "city": "Hà Nội", "revenue": 60000000, "quantity": 3000, "region": "Bắc" }
  ]
}
```

**Logic:**
- JOIN `saleReport` với `storeBranch` qua `branch_id`
- GROUP BY `city`
- Map city → region trong service code (~63 tỉnh thành)
- Gom nhóm region và tính tổng

---

### 2.5 API: Profit & Margin

**Endpoint:** `GET /analytics/profit`

**Chức năng:** Phân tích lợi nhuận gộp, biên lợi nhuận theo từng sản phẩm và nhóm sản phẩm.

**Công thức:**
- `gross_profit = sold_qty * (listing_price - price_cost)`
- `margin = (profit / revenue) * 100`

**Output:**

```json
{
  "totalProfit": 123456789,
  "totalRevenue": 987654321,
  "overallMargin": 12.5,
  "fromMonth": "2023-01",
  "toMonth": "2023-12",
  "topProfit": [
    { "product_id": "SP001", "product_name": "Đen", "detail_product_group": "SANTD",
      "gross_profit": 50000000, "revenue": 150000000, "quantity": 1200, "margin": 33.33, "avg_unit_profit": 41667 }
  ],
  "bottomProfit": [ /* tương tự, sắp xếp ASC */ ],
  "byProductGroup": [
    { "group": "SANTD", "profit": 80000000, "revenue": 350000000, "margin": 22.86, "quantity": 5000 }
  ]
}
```

**Logic:**
- JOIN `saleReport` với `product`
- Tính profit = `sold_qty * (listing_price - price_cost)`
- Top profit: ORDER BY profit DESC LIMIT N
- Bottom profit: ORDER BY profit ASC LIMIT N
- By product group: GROUP BY `detail_product_group`

---

### 2.6 API: YoY Comparison

**Endpoint:** `GET /analytics/revenue/yoy`

**Chức năng:** So sánh doanh thu, số lượng bán cùng kỳ năm trước (Year-over-Year).

**Output:**

```json
{
  "fromMonth": "2023-01",
  "toMonth": "2023-12",
  "comparison": [
    { "month": "2023-01", "year": 2023, "revenue": 100000000, "yoyRevenue": 80000000, "yoyGrowth": 25.0 },
    { "month": "2023-02", "year": 2023, "revenue": 120000000, "yoyRevenue": 90000000, "yoyGrowth": 33.33 }
  ],
  "summary": {
    "avgYoYGrowth": 10.5,
    "positiveMonths": 8,
    "negativeMonths": 4
  }
}
```

**Logic:**
- Với MySQL >= 8.0: dùng `LAG(revenue, 12) OVER (ORDER BY month)`
- Fallback: self-join tháng hiện tại với tháng (year - 1) của chính nó
- `yoyGrowth = ((revenue - yoyRevenue) / yoyRevenue) * 100`

---

## 3. Bước 2 — NestJS Inventory + Cross-module Analytics

### 3.1 API: Inventory Value

**Endpoint:** `GET /analytics/inventory/value`

**Chức năng:** Tính tổng giá trị tồn kho theo giá bán và giá vốn, phân tích theo nhà máy và nhóm sản phẩm.

**Output:**

```json
{
  "totalInventoryValue": 5000000000,
  "totalCostValue": 3000000000,
  "byPlant": [
    { "plant_id": "P01", "name_plant": "Nhà máy A", "value": 2500000000, "cost": 1500000000, "sku_count": 120, "percentage": 50.0 }
  ],
  "byProductGroup": [
    { "group": "SANTD", "value": 2000000000, "cost": 1200000000, "percentage": 40.0 }
  ]
}
```

**Logic:**
- JOIN `InventoryReport` với `product` và `Plant`
- `inventory_value = SUM(quantity * listing_price)`
- `cost_value = SUM(quantity * price_cost)`
- GROUP BY `plant_id` và `detail_product_group`

---

### 3.2 API: Inventory Turnover

**Endpoint:** `GET /analytics/inventory/turnover`

**Chức năng:** Tính vòng quay kho = `sold_qty(period) / avg_inventory_qty(period)` cho từng sản phẩm theo tháng.

**Output:**

```json
{
  "turnovers": [
    {
      "product_id": "SP001",
      "product_name": "Đen",
      "avg_turnover": 3.5,
      "months": [
        { "month": "2023-01", "sold_qty": 300, "avg_inv": 100, "turnover": 3.0 },
        { "month": "2023-02", "sold_qty": 400, "avg_inv": 100, "turnover": 4.0 }
      ]
    }
  ],
  "summary": {
    "avg_turnover": 2.8,
    "fast_moving": [ /* top 5 sản phẩm vòng quay cao nhất */ ],
    "slow_moving": [ /* top 5 sản phẩm vòng quay thấp nhất */ ]
  }
}
```

**Logic:**
- CTE1: `sales_by_month` = SUM sold_quantity GROUP BY product_id, month (từ saleReport)
- CTE2: `inventory_by_month` = AVG quantity GROUP BY product_id, month (từ InventoryReport)
- JOIN 2 CTE → turnover = sold_qty / avg_inv_qty

---

### 3.3 API: Stockout Risk

**Endpoint:** `GET /analytics/inventory/stockout-risk`

**Chức năng:** Phát hiện sản phẩm có nguy cơ hết hàng dựa trên tồn kho hiện tại và tốc độ bán.

**Phân loại risk level:**

| Risk Level | Điều kiện | Ý nghĩa |
|------------|-----------|---------|
| `critical` | `current_stock = 0` AND `monthly_sales > 0` | Hết hàng nhưng vẫn có nhu cầu |
| `warning` | `current_stock < monthly_sales` | Tồn kho không đủ 1 tháng bán |
| `ok` | Còn lại | |

**Output:**

```json
{
  "critical": [
    { "product_id": "SP005", "product_name": "Đỏ", "detail_product_group": "DEPTD", "current_stock": 0, "monthly_sales": 150, "risk_level": "critical" }
  ],
  "warning": [
    { "product_id": "SP010", "product_name": "Xanh", "detail_product_group": "SANTD", "current_stock": 20, "monthly_sales": 50, "risk_level": "warning" }
  ],
  "total_at_risk": 2
}
```

**Logic:**
- Lấy tồn kho mới nhất (MAX calendar_year_week)
- Lấy tổng bán 30 ngày gần nhất
- So sánh và phân loại
- ORDER BY mức độ nguy hiểm giảm dần

---

### 3.4 API: Excess Inventory

**Endpoint:** `GET /analytics/inventory/excess`

**Chức năng:** Phát hiện sản phẩm tồn kho quá nhiều so với tốc độ bán (> 6 tháng).

**Output:**

```json
{
  "excessItems": [
    {
      "product_id": "SP020",
      "product_name": "Vàng",
      "detail_product_group": "GIATR",
      "current_stock": 5000,
      "avg_monthly_sales": 100,
      "months_of_stock": 50,
      "excess_value": 50000000
    }
  ],
  "total_excess_value": 50000000,
  "recommendation": "Sản phẩm SP020 (Vàng) đang tồn kho 50 tháng bán. Cân nhắc giảm sản xuất hoặc có chương trình khuyến mãi."
}
```

**Logic:**
- Lấy tồn kho mới nhất và avg_monthly_sales 90 ngày
- Filter: `current_stock > avg_monthly_sales * 6`
- Tính `months_of_stock = current_stock / avg_monthly_sales`
- Tính `excess_value = current_stock * listing_price`
- Sinh recommendation text tự động

---

### 3.5 API: Branch-Plant Flow

**Endpoint:** `GET /analytics/cross/branch-plant`

**Chức năng:** Phân tích luồng sản phẩm từ nhà máy đến chi nhánh: chi nhánh nào bán nhiều sản phẩm từ nhà máy nào.

**Output:**

```json
{
  "flows": [
    { "source": "Nhà máy A", "target": "Chi nhánh Hà Nội", "group": "SANTD", "sold_qty": 500, "avg_inventory_qty": 200 },
    { "source": "Nhà máy B", "target": "Chi nhánh HCM", "group": "DEPTD", "sold_qty": 400, "avg_inventory_qty": 150 }
  ],
  "summary": {
    "total_sold": 5000,
    "top_route": "Nhà máy A → Chi nhánh Hà Nội (500 sản phẩm)"
  }
}
```

**Logic:**
- JOIN `saleReport` với `storeBranch`, `product`, `InventoryReport`, `Plant`
- GROUP BY branch_name, plant_name, product_group
- `sold_qty` từ saleReport, `avg_inventory_qty` từ InventoryReport
- Output dùng cho Sankey diagram

---

### 3.6 API: Channel-Product Matrix

**Endpoint:** `GET /analytics/cross/channel-product`

**Chức năng:** Ma trận 2 chiều kênh bán × nhóm sản phẩm, hiển thị doanh thu và số lượng.

**Output:**

```json
{
  "matrix": [
    { "channel": "Online", "product_group": "SANTD", "revenue": 20000000, "quantity": 1000 },
    { "channel": "Online", "product_group": "DEPTD", "revenue": 15000000, "quantity": 800 }
  ],
  "row_totals": [
    { "channel": "Online", "revenue": 50000000, "quantity": 2500 }
  ],
  "col_totals": [
    { "product_group": "SANTD", "revenue": 40000000, "quantity": 2000 }
  ]
}
```

**Logic:**
- GROUP BY `distribution_channel`, `detail_product_group`
- Tính row_totals (theo channel) và col_totals (theo product_group)

---

### 3.7 API: Combined Analytics Overview

**Endpoint:** `GET /analytics/overview`

**Chức năng:** Endpoint tổng hợp cho Dashboard Overview. Gọi internal các service method và trả về 1 response duy nhất.

**Output:**

```json
{
  "revenue": { "total": 987654321, "growth": 12.5, "byChannel": [...], "byRegion": [...], "byGender": [...] },
  "profit": { "total": 123456789, "margin": 12.5, "trend": [...] },
  "inventory": { "value": 5000000000, "turnover": 2.8, "stockoutCount": 3, "excessCount": 5 },
  "alerts": { "stockout": [...], "excess": [...], "salesDecline": [] }
}
```

**Logic:**
- Gọi song song 6+ internal methods
- Tổng hợp kết quả
- Có caching 5 phút để giảm tải DB

---

### 3.8 Auto Alerts (Cron Job)

**Chức năng:** Tự động kiểm tra và tạo notification cảnh báo mỗi 6 giờ.

**Các loại cảnh báo:**

| Loại | Điều kiện | Nội dung thông báo |
|------|-----------|-------------------|
| **Stockout Critical** | `current_stock = 0` AND `monthly_sales > 0` | "Sản phẩm {tên} đã hết hàng nhưng vẫn có {N} lượt bán trong tháng" |
| **Stock Low** | `current_stock < 10` AND `> 0` | "Sản phẩm {tên} chỉ còn {N} sản phẩm trong kho" |
| **Excess Inventory** | `current_stock > monthly_sales * 6` | "Sản phẩm {tên} tồn {N} tháng bán, tương đương {X}đ ứ đọng vốn" |
| **Sales Decline** | Doanh thu giảm > 30% so với kỳ trước | "Doanh thu giảm {X}% so với kỳ trước" |

**Files liên quan:**
- Tạo mới: `analytics-alert.service.ts` (dùng `@nestjs/schedule` + `@Cron`)
- Thêm dependency: `@nestjs/schedule`
- Cập nhật: `analytics.module.ts` (thêm ScheduleModule)

---

## 4. Bước 3 — Frontend: Service + Pages Mới

### 4.1 Analytics Service

**File:** `frontend/src/lib/services/analytics.service.ts` (🆕 Tạo mới)

Service gọi tới tất cả API của module analytics backend.

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `revenueByAttribute(params)` | `GET /analytics/revenue/by-attribute` | Revenue theo thuộc tính |
| `revenueByChannel(params)` | `GET /analytics/revenue/by-channel` | Revenue theo kênh |
| `revenueByRegion(params)` | `GET /analytics/revenue/by-region` | Revenue theo vùng |
| `profit(params)` | `GET /analytics/profit` | Profit & margin |
| `revenueYoy(params)` | `GET /analytics/revenue/yoy` | YoY comparison |
| `inventoryValue(params)` | `GET /analytics/inventory/value` | Giá trị tồn kho |
| `inventoryTurnover(params)` | `GET /analytics/inventory/turnover` | Vòng quay kho |
| `stockoutRisk()` | `GET /analytics/inventory/stockout-risk` | Stockout risk |
| `excessInventory()` | `GET /analytics/inventory/excess` | Excess inventory |
| `branchPlantFlow(params)` | `GET /analytics/cross/branch-plant` | Branch → Plant flow |
| `channelProductMatrix(params)` | `GET /analytics/cross/channel-product` | Channel × Product matrix |
| `overview(params)` | `GET /analytics/overview` | Tổng quan |

---

### 4.2 Mở rộng trang `revenue-stats`

**Files:**

| # | File | Hành động | Mô tả |
|---|------|-----------|-------|
| 1 | `revenue-stats/page.tsx` | ✏️ Sửa | Thêm 3 tab mới: "Theo thuộc tính", "Kênh bán", "Vùng miền" + section Profit + YoY |
| 2 | `revenue-stats/types.ts` | ✏️ Sửa | Thêm types cho attribute data, channel data, region data, profit data |
| 3 | `revenue-stats/components/revenue-attribute-tab.tsx` | 🆕 Tạo mới | Tab: 5 nút chọn attribute → BarChart + data table |
| 4 | `revenue-stats/components/revenue-channel-tab.tsx` | 🆕 Tạo mới | Tab: PieChart theo channel + BarChart so sánh |
| 5 | `revenue-stats/components/revenue-region-tab.tsx` | 🆕 Tạo mới | Tab: BarChart vùng + chi tiết từng city |
| 6 | `revenue-stats/components/profit-section.tsx` | 🆕 Tạo mới | KPI profit/margin + top/bottom table + bar chart margin by group |
| 7 | `revenue-stats/components/yoy-chart.tsx` | 🆕 Tạo mới | Dual line chart (năm nay vs năm ngoái) + summary |

**Cấu trúc tabs mới trong page:**

```
[ Tổng quan | Theo thuộc tính | Kênh bán | Vùng miền | Lợi nhuận | YoY ]
```

---

### 4.3 Mở rộng trang `inventory-stats`

**Files:**

| # | File | Hành động | Mô tả |
|---|------|-----------|-------|
| 1 | `inventory-stats/page.tsx` | ✏️ Sửa | Thêm 3 tab mới: "Giá trị kho", "Vòng quay", "Stockout & Excess" |
| 2 | `inventory-stats/components/inventory-value-tab.tsx` | 🆕 Tạo mới | KPI giá trị + BarChart by plant + PieChart by product group |
| 3 | `inventory-stats/components/inventory-turnover-tab.tsx` | 🆕 Tạo mới | Heatmap product × month turnover + top fast/slow moving |
| 4 | `inventory-stats/components/stockout-excess-tab.tsx` | 🆕 Tạo mới | Bảng stockout risk (critical/warning) + excess inventory table |

**Cấu trúc tabs mới:**

```
[ Tổng quan | Cảnh báo | Giá trị kho | Vòng quay | Stockout & Excess ]
```

---

### 4.4 Trang analytics mới

**Route:** `/dashboard/analytics`

**Files:**

| # | File | Mô tả |
|---|------|-------|
| 1 | `frontend/src/app/dashboard/analytics/page.tsx` | Layout page với 3 sub-tabs |
| 2 | `frontend/src/app/dashboard/analytics/components/cross-overview.tsx` | Tổng quan cross-module KPIs |
| 3 | `frontend/src/app/dashboard/analytics/components/cross-branch-plant.tsx` | Branch × Plant flow (Sankey/chord chart) |
| 4 | `frontend/src/app/dashboard/analytics/components/cross-channel-product.tsx` | Channel × Product matrix (heatmap) |

**Cấu trúc tabs:**

```
[ Tổng quan | Chi nhánh ↔ Nhà máy | Kênh bán ↔ Sản phẩm ]
```

---

### 4.5 Cập nhật Dashboard Overview

**Files sửa:**

| # | File | Mô tả thay đổi |
|---|------|---------------|
| 1 | `frontend/src/components/section-cards.tsx` | Thêm 2 KPI cards: **Tổng lợi nhuận** (profit.total) + **Giá trị tồn kho** (inventory.value) |
| 2 | `frontend/src/app/dashboard/components/overview-tab.tsx` | Thêm section "Top lợi nhuận" + "Cảnh báo tồn kho" |
| 3 | `frontend/src/app/dashboard/components/analytics-tab.tsx` | Thêm bar chart by-attribute + YoY mini chart |

**Cấu trúc section-cards mới (6 cards):**

```
[ Tổng doanh thu | Tổng tồn kho | Tăng trưởng kho | Loại SP | Tổng lợi nhuận | Giá trị kho ]
```

---

### 4.6 Cập nhật Sidebar

**File:** `frontend/src/components/app-sidebar.tsx` (✏️ Sửa)

Thêm nav item vào group "Phân tích & Báo cáo":

```typescript
{ title: 'Phân tích chuyên sâu', url: '/dashboard/analytics', icon: <BarChart3Icon /> }
```

---

### 4.7 Components Chart mới

| # | File | Component | Dùng cho | Mô tả |
|---|------|-----------|----------|-------|
| 1 | `chart-heatmap.tsx` | HeatmapChart | Channel×Product matrix, Product×Month turnover | CSS grid + background-color theo giá trị |
| 2 | `chart-dual-line.tsx` | DualLineChart | YoY comparison, Forecast vs Actual | Recharts LineChart với 2 dataset |
| 3 | `chart-treemap.tsx` | TreemapChart | Inventory value by product group | Recharts Treemap component |
| 4 | `chart-waterfall.tsx` | WaterfallChart | Profit breakdown | Custom BarChart |
| 5 | `chart-region-map.tsx` | RegionMapChart | Revenue by region | Kết hợp VietnamMap SVG + overlay data |

---

## 5. Bước 4 — AI + Optimization + Testing

### 5.1 Nâng cấp AI Interpretation (Auto-context)

**Mục tiêu:** Backend tự động fetch dữ liệu analytics và gửi kèm vào prompt AI, thay vì frontend phải nhập 6 metrics thủ công.

**Files sửa:**

| # | File | Thay đổi |
|---|------|----------|
| 1 | `ai-interpretation/ai-interpretation.service.ts` | Inject AnalyticsService, auto-fetch overview + profit + stockout |
| 2 | `ai-interpretation/DTO/interpretation-request.dto.ts` | Simplify: chỉ cần `reportTitle` + `fromMonth?` + `toMonth?` + `language?` |
| 3 | `ai-interpretation/ai-interpretation.module.ts` | Import AnalyticsModule |

**Luồng xử lý mới:**

```
Frontend gửi: { reportTitle: "Báo cáo tháng 1", fromMonth: "2023-01" }
  ↓
Backend tự động query:
  - AnalyticsService.getOverview() → tổng doanh thu, tăng trưởng, top channel, top region
  - AnalyticsService.getProfit() → tổng lợi nhuận, biên lãi
  - AnalyticsService.getStockoutRisk() → số lượng cảnh báo
  ↓
Build prompt với đầy đủ context (10+ metrics)
  ↓
Gửi lên DeepSeek/OpenRouter
  ↓
Trả về: summaryBullets[] + recommendation
```

**Context gửi lên AI:**

```json
{
  "totalRevenue": 987654321,
  "growthRate": 12.5,
  "totalProfit": 123456789,
  "margin": 12.5,
  "topProductRevenue": { "name": "Đen", "revenue": 150000000 },
  "topChannel": { "channel": "Online", "percentage": 40.5 },
  "topRegion": { "region": "Bắc", "percentage": 45.5 },
  "stockoutCount": 3,
  "excessValue": 50000000,
  "profitTrend": [
    { "group": "SANTD", "margin": 22.86 },
    { "group": "GIATR", "margin": 15.0 }
  ]
}
```

---

### 5.2 Tối ưu hiệu năng Backend

| # | Module | Vấn đề | Giải pháp |
|---|--------|--------|-----------|
| 1 | `analytics.service.ts` | Query lặp lại | **Cache layer**: Map<key, {data, expiresAt}> với TTL 5 phút. Cache key = tên method + query params |
| 2 | `data-processing.service.ts` | Product import N+1 queries | **Bulk insert**: Dùng INSERT IGNORE batch, bỏ kiểm tra từng product riêng lẻ |
| 3 | `database` | Không index cho analytics queries | **Add index**: composite index `(product_id, time_report)` trên saleReport, `(product_id, calendar_year_week)` trên InventoryReport |

---

### 5.3 Thêm `slugify` cho URL sản phẩm

**Chức năng:** Tạo URL friendly slug cho sản phẩm từ `color + gender + size` (VD: "Đen-MEN-42" → "den-men-42").

**Files:**
- `backend/package.json`: Thêm `slugify`
- `backend/src/modules/products/product.service.ts`: Tạo slug khi create/update
- DB migration: Thêm cột `slug VARCHAR(255) UNIQUE` vào bảng product

---

### 5.4 Thêm `@nestjs/serve-static` cho Production

**Chức năng:** NestJS serve frontend build trực tiếp trong production (không cần chạy Next.js server riêng).

**Files:**
- `backend/package.json`: Thêm `@nestjs/serve-static`
- `backend/src/app.module.ts`: Import `ServeStaticModule.forRoot()` trỏ đến thư mục build của frontend
- Exclude `/api*` và `/docs*` khỏi static serving

---

### 5.5 Testing

| # | File | Test case |
|---|------|-----------|
| 1 | `analytics.service.spec.ts` | `getRevenueByAttribute` với mock DB, filter tháng, empty result |
| 2 | `analytics.service.spec.ts` | `getProfit` — verify calculation đúng (profit = qty * (price - cost)) |
| 3 | `analytics.service.spec.ts` | `getStockoutRisk` — verify phân loại critical/warning |
| 4 | `analytics.controller.spec.ts` | Status 200 (success), 401 (no auth), 400 (invalid params) |

---

## 6. Bước 5 — FastAPI Microservice: Xử Lý Dữ Liệu Chuyên Sâu

### 6.1 Tổng quan

**Lý do thêm FastAPI:**

| Vấn đề với NestJS hiện tại | Giải pháp với FastAPI |
|---------------------------|----------------------|
| Forecasting chỉ EMA + LR đơn giản | Python có `statsmodels`, `prophet`, `scikit-learn` cho forecast chuyên sâu |
| Không có thống kê nâng cao (t-test, ANOVA, correlation) | Python `scipy`, `numpy`, `pandas` |
| Excel/PDF generation chậm với PDFKit | Python `pandas`, `openpyxl`, `matplotlib` |
| Không có data pipeline / ETL | Python `pandas` + `SQLAlchemy` cho ETL mạnh mẽ |
| AI interpretation thủ công | Python `langchain` + `llama-index` cho RAG agent |
| Không có scheduling linh hoạt | Python `celery` + `redis` cho task queue |

**Kiến trúc:**

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend      │────▶│   NestJS (API)   │────▶│   MySQL DB   │
│   (Next.js)     │     │   - CRUD         │     │              │
│                 │     │   - Analytics    │     └──────────────┘
│                 │     │   - Auth         │            │
│                 │     └──────────────────┘            │
│                 │              │                      │
│                 │              ▼                      ▼
│                 │     ┌──────────────────┐     ┌──────────────┐
│                 │     │  FastAPI (Data)  │◀───▶│   Redis      │
│                 │     │  - Forecasting   │     │   (Cache)    │
│                 │     │  - Statistics    │     └──────────────┘
│                 │     │  - ETL Pipeline  │
│                 │     │  - Report Gen    │
│                 │     │  - AI Agent      │
│                 └─────└──────────────────┘
```

**Luồng dữ liệu:**
1. NestJS gọi internal qua HTTP đến FastAPI (hoặc qua message queue)
2. FastAPI đọc trực tiếp từ MySQL (read-only replica hoặc cùng DB)
3. Kết quả trả về NestJSON → frontend
4. Hoặc FastAPI push kết quả vào Redis → NestJS đọc

**Hoặc đơn giản hơn:** Frontend gọi trực tiếp FastAPI cho các tác vụ nặng, NestJS vẫn giữ CRUD + analytics nhẹ.

---

### 6.2 Cấu trúc project

```
backend-fastapi/
├── main.py                      # FastAPI app entry point
├── requirements.txt             # Python dependencies
├── .env                         # Config (DB connection, API keys)
├── docker-compose.yml           # (tuỳ chọn) Service container
├── app/
│   ├── __init__.py
│   ├── config.py                # Settings from .env
│   ├── database.py              # SQLAlchemy async engine + session
│   │
│   ├── models/                  # SQLAlchemy models (đọc từ MySQL)
│   │   ├── __init__.py
│   │   ├── product.py
│   │   ├── sale_report.py
│   │   ├── inventory_report.py
│   │   ├── branch.py
│   │   └── plant.py
│   │
│   ├── schemas/                 # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── forecast.py
│   │   ├── statistics.py
│   │   ├── report.py
│   │   └── etl.py
│   │
│   ├── routers/                 # API endpoints
│   │   ├── __init__.py
│   │   ├── forecast.py          # Forecasting endpoints
│   │   ├── statistics.py        # Advanced statistics
│   │   ├── report.py            # Report generation (PDF/Excel)
│   │   ├── etl.py               # Data pipeline endpoints
│   │   └── ai.py                # AI Agent endpoints
│   │
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── forecast_service.py
│   │   ├── statistics_service.py
│   │   ├── report_service.py
│   │   └── ai_service.py
│   │
│   ├── ml/                      # Machine Learning models
│   │   ├── __init__.py
│   │   ├── prophet_model.py
│   │   ├── arima_model.py
│   │   ├── ensemble.py
│   │   └── utils.py
│   │
│   └── utils/                   # Utility functions
│       ├── __init__.py
│       ├── excel.py             # Excel generation
│       ├── pdf.py               # PDF generation
│       └── cache.py             # Redis cache helper
│
└── tests/                       # Unit tests
    ├── __init__.py
    ├── test_forecast.py
    ├── test_statistics.py
    └── test_etl.py
```

---

### 6.3 Danh sách API endpoints

#### Nhóm Forecasting Nâng Cao

| # | Endpoint | Method | Mô tả | Input | Output |
|---|----------|--------|-------|-------|--------|
| 1 | `/api/v1/forecast/prophet` | POST | Dự báo doanh thu/số lượng bằng Facebook Prophet (hỗ trợ seasonality) | `{ source: "sales"\|"inventory", product_id?, period: "month"\|"week", horizon: 1-24, history_months: 12-36 }` | `{ model: "prophet", metrics: { mape, rmse, mae }, forecast: [{period, value, lower_bound, upper_bound}], components: {trend, yearly, weekly} }` |
| 2 | `/api/v1/forecast/arima` | POST | Dự báo bằng ARIMA (auto ARIMA parameters) | Tương tự trên | `{ model: "arima", order: (p,d,q), metrics: {...}, forecast: [...] }` |
| 3 | `/api/v1/forecast/ensemble` | POST | Ensemble nhiều model (Prophet + ARIMA + EMA + LR) lấy trung bình | Tương tự trên | `{ models: ["prophet","arima","ema","lr"], combined_forecast: [...], weights: {...} }` |
| 4 | `/api/v1/forecast/revenue` | POST | Dự báo doanh thu (sold_qty * avg_price) — cái NestJS không làm được | `{ product_id?, branch_id?, horizon }` | `{ revenue_forecast: [{period, revenue, lower, upper}], drivers: {price_trend, volume_trend} }` |

#### Nhóm Thống Kê Nâng Cao

| # | Endpoint | Method | Mô tả | Input | Output |
|---|----------|--------|-------|-------|--------|
| 5 | `/api/v1/statistics/descriptive` | GET | Thống kê mô tả: mean, median, std, min, max, percentile | `{ field: "revenue"\|"quantity"\|"profit", group_by?: "channel"\|"product_group" }` | `{ overall: {mean, median, std, min, max, p25, p75}, by_group: [...] }` |
| 6 | `/api/v1/statistics/correlation` | GET | Ma trận tương quan giữa các biến (revenue, quantity, price, cost, inventory) | `{ fromMonth?, toMonth? }` | `{ matrix: [[var1, var2, r, p_value]], heatmap_data: [...], insights: "..." }` |
| 7 | `/api/v1/statistics/seasonality` | GET | Phân tích mùa vụ: decompose doanh thu theo tháng/quý | `{ year? }` | `{ monthly_factors: [{month, factor, avg_revenue}], seasonal_strength, peak_months, trough_months }` |
| 8 | `/api/v1/statistics/anomalies` | GET | Phát hiện bất thường: điểm doanh thu/quá thấp/ quá cao bất thường | `{ method: "zscore"\|"iqr"\|"isolation_forest", threshold? }` | `{ anomalies: [{period, value, expected, deviation, severity}], total_anomalies }` |
| 9 | `/api/v1/statistics/product-segmentation` | GET | Phân khúc sản phẩm theo ABC/XYZ (doanh thu + biến động) | `{ fromMonth?, toMonth? }` | `{ segments: { A: [...], B: [...], C: [...] }, recommendations: "..." }` |

#### Nhóm ETL & Import

| # | Endpoint | Method | Mô tả | Input | Output |
|---|----------|--------|-------|-------|--------|
| 10 | `/api/v1/etl/validate` | POST | Validate file Excel trước khi import (kiểm tra header, data type, FK) | `file: multipart/form-data, type: "product"\|"sale"\|"inventory"` | `{ valid: bool, errors: [{row, field, message}], stats: {total_rows, valid_rows, error_rows} }` |
| 11 | `/api/v1/etl/import` | POST | Import dữ liệu từ Excel vào DB (tự động mapping + transform) | `file, type, mode: "append"\|"replace"\|"merge"` | `{ inserted, updated, skipped, errors }` |
| 12 | `/api/v1/etl/schedule` | POST | Lên lịch import tự động từ folder | `{ path: string, cron: string, type: string }` | `{ scheduled: true, job_id, next_run }` |
| 13 | `/api/v1/etl/data-quality` | GET | Báo cáo chất lượng dữ liệu: null rate, duplicate rate, outlier count | `{ tables?: string[] }` | `{ tables: [{name, total_rows, null_fields: [...], duplicates, outliers}], overall_score }` |

#### Nhóm Report Generation Nâng Cao

| # | Endpoint | Method | Mô tả | Input | Output |
|---|----------|--------|-------|-------|--------|
| 14 | `/api/v1/report/dashboard-pdf` | POST | Tạo PDF dashboard tổng quan (đẹp hơn PDFKit, dùng matplotlib) | `{ fromMonth, toMonth, sections: string[] }` | `application/pdf` (stream) |
| 15 | `/api/v1/report/forecast-report` | POST | Tạo PDF báo cáo dự báo kèm biểu đồ | `{ forecast_params, include_confidence: bool }` | `application/pdf` |
| 16 | `/api/v1/report/excel-advanced` | POST | Tạo Excel với conditional formatting, charts, pivot | `{ type: "revenue"\|"inventory"\|"profit", fromMonth, toMonth }` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

#### Nhóm AI Agent

| # | Endpoint | Method | Mô tả | Input | Output |
|---|----------|--------|-------|-------|--------|
| 17 | `/api/v1/ai/analyze` | POST | Phân tích toàn diện: AI tự query DB + đưa insight | `{ query?: string, fromMonth?, toMonth?, focus?: string[] }` | `{ summary: string, insights: [...], charts: [...], recommendations: [...] }` |
| 18 | `/api/v1/ai/ask` | POST | Hỏi đáp bằng tiếng Việt: map câu hỏi → SQL → trả lời | `{ question: string }` | `{ answer: string, sql?: string, data?: any, confidence: number }` |
| 19 | `/api/v1/ai/narrative` | POST | Tạo narrative report: AI viết báo cáo bằng văn xuôi | `{ report_title, period, focus: string[] }` | `{ narrative: string, key_findings: [...], action_items: [...] }` |

---

### 6.4 Chi tiết các service chính

#### 6.4.1 Forecasting Service

**Mô tả:** Sử dụng `prophet` và `statsmodels` để dự báo chính xác hơn NestJS hiện tại.

**Thuật toán:**

| Model | Ưu điểm | Nhược điểm |
|-------|---------|------------|
| **Prophet** | Tự động phát hiện seasonality (năm, tuần, ngày), robust với missing data, có confidence interval | Chậm hơn ARIMA với dữ liệu lớn |
| **ARIMA/SARIMA** | Tốt cho dữ liệu có tính chu kỳ rõ rệt | Cần tuning parameters, không robust với outliers |
| **Ensemble** | Weighted average nhiều model → ổn định hơn | Phức tạp hơn, cần tuning weights |

**Output mẫu (Prophet):**

```json
{
  "model": "prophet",
  "metrics": {
    "mape": 8.5,
    "rmse": 1250000,
    "mae": 980000
  },
  "forecast": [
    { "period": "2023-07", "value": 150000000, "lower_bound": 135000000, "upper_bound": 165000000 }
  ],
  "components": {
    "trend": [{ "period": "2023-01", "value": 140000000 }],
    "yearly": [{ "period": "January", "factor": 1.15 }],
    "weekly": [{ "period": "Monday", "factor": 0.95 }]
  }
}
```

#### 6.4.2 Statistics Service

**Mô tả:** Các phân tích thống kê nâng cao không có trong NestJS.

**Correlation matrix:**

```python
# Sử dụng scipy.stats.pearsonr + spearmanr
# Biến: revenue, quantity, listing_price, price_cost, inventory_qty
# Output: ma trận 5x5 với r và p-value
# Insight: "Giá bán và doanh thu có tương quan dương r=0.67 (p<0.01)"
```

**Seasonality:**

```python
# Dùng statsmodels.tsa.seasonal_decompose
# Tách: trend + seasonal + residual
# Tính seasonal factor cho từng tháng
# Xác định: peak month, trough month, seasonal strength
```

**Anomaly detection:**

```python
# Phương pháp:
# 1. Z-score: |z| > 3 = anomaly
# 2. IQR: value < Q1 - 1.5*IQR hoặc > Q3 + 1.5*IQR
# 3. Isolation Forest (nếu có nhiều features)
```

**ABC/XYZ Segmentation:**

```python
# ABC: dựa trên cumulative revenue %
#   A: top 70% revenue, B: next 20%, C: last 10%
# XYZ: dựa trên coefficient of variation (CV) của sales
#   X: CV < 0.3 (ổn định), Y: CV 0.3-0.7, Z: CV > 0.7 (biến động)
# Kết hợp: AX = best, CZ = worst
```

#### 6.4.3 ETL Service

**Mô tả:** Xử lý import dữ liệu mạnh mẽ hơn NestJS.

**Luồng xử lý:**

```
Upload file (.xlsx / .csv)
  ↓
Validate headers + data types + FK references
  ↓
Transform (map cột, normalize, sinh UUID)
  ↓
Dry-run: báo cáo số lượng hợp lệ / lỗi
  ↓
User confirm → Import thật:
  - Append: thêm mới
  - Replace: xóa cũ + insert
  - Merge: update nếu tồn tại
  ↓
Báo cáo kết quả: inserted, updated, skipped, errors
```

**Data quality report:**

```json
{
  "tables": [
    {
      "name": "saleReport",
      "total_rows": 15000,
      "null_fields": [
        { "field": "time_report", "null_count": 0, "null_rate": 0 },
        { "field": "sold_quantity", "null_count": 3, "null_rate": 0.02 }
      ],
      "duplicates": { "sale_id": 0 },
      "outliers": { "sold_quantity": { "count": 5, "threshold": "> 10000" } }
    }
  ],
  "overall_score": 92.5,
  "recommendations": [
    "Bảng saleReport: 3 bản ghi thiếu sold_quantity",
    "Bảng product: 12 sản phẩm có listing_price = 0"
  ]
}
```

#### 6.4.4 AI Agent Service

**Mô tả:** Sử dụng LangChain + LLM để tạo agent có thể query DB và phân tích.

**Luồng xử lý (Text-to-SQL):**

```
User: "Tháng trước sản phẩm nào bán chạy nhất ở miền Bắc?"
  ↓
1. LLM phân tích câu hỏi → intent: top_product_by_region
2. LLM sinh SQL:
   SELECT p.color, SUM(sr.sold_quantity) as total
   FROM saleReport sr
   JOIN product p ON p.product_id = sr.product_id
   JOIN storeBranch sb ON sb.store_id = sr.branch_id
   WHERE sb.city IN ('Hà Nội','Hải Phòng','...')
     AND sr.time_report BETWEEN '2023-12-01' AND '2023-12-31'
   GROUP BY p.color ORDER BY total DESC LIMIT 5
3. Execute SQL → lấy kết quả
4. LLM sinh câu trả lời tiếng Việt tự nhiên
  ↓
"Tháng trước, sản phẩm bán chạy nhất ở miền Bắc là 'Đen' (1.200 sản phẩm). 
 Tiếp theo là 'Trắng' (980 sản phẩm) và 'Xanh' (750 sản phẩm)."
```

**Tools agent có thể dùng:**

| Tool | Mô tả | Parameters |
|------|-------|------------|
| `query_db(sql)` | Execute SQL query | `sql: string` |
| `get_analytics_overview()` | Lấy tổng quan analytics | Không |
| `get_profit_report()` | Lấy báo cáo lợi nhuận | `fromMonth, toMonth` |
| `get_stockout_alerts()` | Lấy cảnh báo tồn kho | Không |
| `get_forecast(product_id)` | Lấy dự báo | `product_id, horizon` |
| `generate_chart(data, type)` | Tạo biểu đồ | `data, chart_type` |

---

### 6.5 Docker Compose cho FastAPI

```yaml
# docker-compose.yml (bổ sung vào file hiện có)
services:
  # ... existing services (mysql, backend, frontend)

  fastapi:
    build:
      context: ./backend-fastapi
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mysql+aiomysql://user:password@mysql:3306/revenue
      - REDIS_URL=redis://redis:6379/0
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    depends_on:
      - mysql
      - redis
    volumes:
      - ./backend-fastapi:/app
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

---

### 6.6 Khi nào NestJS, khi nào FastAPI?

| Loại tác vụ | Xử lý bởi | Lý do |
|-------------|-----------|-------|
| CRUD thuần (tạo/sửa/xóa entity) | **NestJS** | Đã có sẵn, phù hợp |
| Auth, JWT, roles | **NestJS** | Guard/Interceptor có sẵn |
| API analytics nhẹ (by-attribute, by-channel, profit) | **NestJS** | Query đơn giản, response nhanh |
| Forecasting nâng cao (Prophet, ARIMA, ensemble) | **FastAPI** | Python ecosystem |
| Thống kê (correlation, seasonality, anomaly) | **FastAPI** | scipy, numpy |
| ETL phức tạp (validate, transform, merge) | **FastAPI** | pandas, openpyxl |
| PDF/Excel báo cáo đẹp | **FastAPI** | matplotlib, openpyxl, reportlab |
| AI Agent (text-to-SQL, narrative) | **FastAPI** | langchain, llama-index |
| Cache layer | **Redis** (cả 2 đọc) | shared cache |

---

## 7. Tổng Quan Files Bị Ảnh Hưởng

### NestJS Backend (15 files)

| Type | Files | Số lượng |
|------|-------|----------|
| 🆕 Tạo mới | `analytics.module.ts`, `analytics.service.ts`, `analytics.controller.ts`, `analytics-alert.service.ts`, DTO, interface, spec files | 7 |
| ✏️ Sửa | `app.module.ts`, `ai-interpretation.service.ts`, `ai-interpretation.module.ts`, DTO, `data-processing.service.ts`, `product.service.ts` | 6 |
| ✏️ Sửa | `package.json` (thêm `@nestjs/schedule`, `slugify`, `@nestjs/serve-static`) | 1 |
| 🆕 DB Migration | Thêm cột `slug` vào product + composite indexes | 1 |

### Frontend (22 files)

| Type | Files | Số lượng |
|------|-------|----------|
| 🆕 Tạo mới | `analytics.service.ts`, 5 revenue-stats components, 4 inventory-stats components, 3 analytics page components, 5 chart components | 18 |
| ✏️ Sửa | `revenue-stats/page.tsx`, `inventory-stats/page.tsx`, `section-cards.tsx`, `overview-tab.tsx`, `analytics-tab.tsx`, `app-sidebar.tsx`, `revenue-stats/types.ts` | 7 |

### FastAPI (20+ files)

| Type | Files | Số lượng |
|------|-------|----------|
| 🆕 Tạo mới | `main.py`, `config.py`, `database.py`, 6 models, 5 schemas, 5 routers, 4 services, 3 ml models, 3 utils | 20+ |
| 🆕 Tạo mới | `requirements.txt`, `Dockerfile`, test files | 3 |
| 🆕 Tạo mới | `docker-compose.yml` (bổ sung fastapi + redis services) | 1 |

---

## 8. Timeline Dự Kiến

### NestJS + Frontend (~29 giờ)

| Bước | Tasks | Thời gian |
|------|-------|-----------|
| **Bước 1** | Module analytics + revenue APIs (by-attribute, by-channel, by-region, profit, YoY) | 6 giờ |
| **Bước 2** | Inventory APIs + cross-module APIs + overview + cron alerts | 7 giờ |
| **Bước 3** | Frontend: service, revenue-stats, inventory-stats, analytics page, charts | 10 giờ |
| **Bước 4** | AI auto-context, optimization, slugify, serve-static, testing | 4 giờ |

### FastAPI (~20 giờ)

| Bước | Tasks | Thời gian |
|------|-------|-----------|
| **Project setup** | Cấu trúc project, database models, schemas, Docker | 2 giờ |
| **Forecasting** | Prophet + ARIMA + ensemble APIs | 5 giờ |
| **Statistics** | Descriptive stats, correlation, seasonality, anomaly detection, ABC/XYZ | 4 giờ |
| **ETL** | Validate + import + schedule + data quality | 4 giờ |
| **Report gen** | PDF + Excel nâng cao | 2 giờ |
| **AI Agent** | Text-to-SQL, narrative report | 3 giờ |

### Tổng cộng: ~49 giờ (~6-7 ngày làm việc)

### Phân bổ theo ngày

```
Ngày 1-2:   Bước 1 (NestJS APIs revenue)
Ngày 3:     Bước 2 (NestJS APIs inventory + cross)
Ngày 4:     Bước 2 (overview + alerts)
Ngày 5-6:   Bước 3 (Frontend: revenue-stats + inventory-stats)
Ngày 7:     Bước 3 (Frontend: analytics page + charts)
Ngày 8:     Bước 4 (AI, optimization, testing)
Ngày 9-10:  Bước 5 (FastAPI: project setup + forecasting + statistics)
Ngày 11:    Bước 5 (FastAPI: ETL + report gen)
Ngày 12:    Bước 5 (FastAPI: AI Agent + testing + deploy)
```
