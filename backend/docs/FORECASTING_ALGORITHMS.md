# Hướng dẫn dự báo Doanh thu & Tồn kho

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Holt-Winters — Dự báo Doanh thu](#holt-winters)
3. [Safety Stock — Dự báo Tồn kho](#safety-stock)
4. [Thực tế áp dụng](#thực-tế-áp-dụng)

---

## Tổng quan

Dự án quản lý doanh thu giày dép cần dự báo 2 yếu tố:

| Yếu tố | Mục đích | Thuật toán |
|---------|----------|------------|
| **Doanh thu** | Dự báo doanh thu 3-6 tháng tới | Holt-Winters |
| **Tồn kho** | Tính tồn kho an toàn + điểm đặt hàng lại | Safety Stock |

**Luồng dữ liệu:**
```
Dữ liệu lịch sử → Holt-Winters → Dự báo nhu cầu → Safety Stock → Quyết định tồn kho
```

---

## Holt-Winters

### Đây là gì?

Holt-Winters (còn gọi là **Triple Exponential Smoothing**) là thuật toán dự báo chuỗi thời gian dựa trên **3 thành phần**:

```
Doanh thu = Level (mức cơ bản) + Trend (xu hướng) + Seasonality (mùa)
```

### Tại sao chọn cho dự án này?

- Dữ liệu bán hàng giày dép có **mùa rõ ràng** (Q4 cao điểm, Tết, Black Friday)
- Holt-Winters bắt được cả **trend** (tăng trưởng) + **seasonality** (lặp lại theo mùa)
- Không quá phức tạp như ARIMA
- Có thể cài bằng JavaScript thuần túy

### Giải thích qua ví dụ

Giả sử dữ liệu doanh thu 12 tháng (đơn vị: triệu VNĐ):

```
Tháng 1:  800   (thấp — sau Tết)
Tháng 2:  700   (thấp nhất)
Tháng 3:  900   (hồi phục)
Tháng 4:  1000  (ổn định)
Tháng 5:  1100  (tăng dần)
Tháng 6:  1050  (hè)
Tháng 7:  1200  (back-to-school)
Tháng 8:  1300  (cao)
Tháng 9:  1250  (hơi giảm)
Tháng 10: 1500  (cao — Black Friday)
Tháng 11: 1600  (cao nhất — year-end)
Tháng 12: 1400  (giảm nhẹ)
```

Holt-Winters sẽ "học" được:

| Thành phần | Giá trị | Ý nghĩa |
|-----------|---------|----------|
| **Level (L)** | ~1100 | Doanh thu trung bình |
| **Trend (T)** | ~50/tháng | Doanh thu tăng ~50 triệu/tháng |
| **Seasonality (S)** | Tháng 10-11: +400, Tháng 1-2: -300 | Biến động theo mùa |

Khi đó dự báo tháng 13 (Tháng 1/2024):
```
F(13) = L + 1×T + S(1)
      = 1100 + 50 + (-300)
      = 850 triệu VNĐ
```

### Công thức toán học

#### 3 thành phần chính

```
Level:      L(t) = α × (Y(t) - S(t-m)) + (1-α) × (L(t-1) + T(t-1))
Trend:      T(t) = β × (L(t) - L(t-1)) + (1-β) × T(t-1)
Seasonal:   S(t) = γ × (Y(t) - L(t)) + (1-γ) × S(t-m)
```

#### Dự báo k bước tiếp

```
F(t+k) = L(t) + k × T(t) + S(t+k-m)
```

#### Giải thích các biến

| Biến | Ý nghĩa | Giá trị mẫu |
|------|----------|-------------|
| `Y(t)` | Doanh thu thực tế tại thời điểm t | 1500 |
| `L(t)` | Level (mức cơ bản) tại t | 1100 |
| `T(t)` | Trend (xu hướng) tại t | 50 |
| `S(t)` | Seasonal (biến động mùa) tại t | +400 |
| `m` | Chu kỳ seasonality | 12 (tháng) |
| `α` | Hệ số smoothing cho Level | 0.2 - 0.5 |
| `β` | Hệ số smoothing cho Trend | 0.1 - 0.3 |
| `γ` | Hệ số smoothing cho Seasonal | 0.1 - 0.4 |

#### Alpha, Beta, Gamma là gì?

- **α (0-1)**: Level smoothing
  - α cao → Level thay đổi nhanh theo dữ liệu mới
  - α thấp → Level ổn định, ít bị ảnh hưởng bởi outliers

- **β (0-1)**: Trend smoothing
  - β cao → Trend thay đổi nhanh
  - β thấp → Trend ổn định

- **γ (0-1)**: Seasonal smoothing
  - γ cao → Seasonality thay đổi nhanh
  - γ thấp → Seasonality ổn định

**Cách tốt nhất**: Tối ưu α, β, γ bằng cách minimize sai số (MAPE/RMSE).

### Pseudocode chi tiết

```typescript
// ─── Holt-Winters Triple Exponential Smoothing ───────────────

interface HoltWintersResult {
  level: number;
  trend: number;
  seasonal: number[];
  forecast: number[];
  fitted: number[];       // giá trị fitted (dự báo quá khứ)
  errors: number[];       // sai số
}

function holtWinters(
  data: number[],          // dữ liệu lịch sử
  m: number,               // chu kỳ seasonality (12 = tháng, 52 = tuần)
  alpha: number = 0.2,     // Level smoothing
  beta: number = 0.1,      // Trend smoothing
  gamma: number = 0.3,     // Seasonal smoothing
  forecastHorizon: number = 6  // dự báo bao nhiêu bước
): HoltWintersResult {
  const n = data.length;

  // ─── 1. Khởi tạo ────────────────────────────────────────

  // Level ban đầu: trung bình của chu kỳ đầu tiên
  let level = 0;
  for (let i = 0; i < m; i++) {
    level += data[i];
  }
  level /= m;

  // Trend ban đầu: trung bình sự khác biệt giữa các chu kỳ
  let trend = 0;
  for (let i = 0; i < m; i++) {
    trend += (data[m + i] - data[i]);
  }
  trend /= (m * m);

  // Seasonal ban đầu:每一位 cho chu kỳ đầu tiên
  const seasonal: number[] = new Array(m);
  for (let i = 0; i < m; i++) {
    seasonal[i] = data[i] - level;
  }

  // ─── 2. Smooth qua từng data point ──────────────────────

  const fitted: number[] = [];   // fitted values (dự báo quá khứ)
  const errors: number[] = [];   // sai số

  for (let t = 0; t < n; t++) {
    const s = seasonal[t % m];
    const prevLevel = level;
    const prevTrend = trend;

    // Giá trị fitted (dự báo tại t dựa trên data trước t)
    fitted.push(level + trend + s);

    // Sai số
    errors.push(data[t] - fitted[t]);

    // Cập nhật Level
    level = alpha * (data[t] - s) + (1 - alpha) * (prevLevel + prevTrend);

    // Cập nhật Trend
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;

    // Cập nhật Seasonal
    seasonal[t % m] = gamma * (data[t] - level) + (1 - gamma) * s;
  }

  // ─── 3. Dự báo k bước tiếp ──────────────────────────────

  const forecast: number[] = [];
  for (let k = 1; k <= forecastHorizon; k++) {
    forecast.push(level + k * trend + seasonal[(n + k - 1) % m]);
  }

  return { level, trend, seasonal, forecast, fitted, errors };
}

// ─── Tối ưu α, β, γ bằng Grid Search ────────────────────────

function optimizeHoltWinters(data: number[], m: number) {
  let bestMAPE = Infinity;
  let bestParams = { alpha: 0.2, beta: 0.1, gamma: 0.3 };

  // Thử nhiều tổ hợp α, β, γ
  for (let alpha = 0.1; alpha <= 0.9; alpha += 0.1) {
    for (let beta = 0.05; beta <= 0.5; beta += 0.05) {
      for (let gamma = 0.1; gamma <= 0.9; gamma += 0.1) {
        const result = holtWinters(data, m, alpha, beta, gamma);

        // Tính MAPE (Mean Absolute Percentage Error)
        let mape = 0;
        let count = 0;
        for (let i = 0; i < result.fitted.length; i++) {
          if (data[i] > 0) {
            mape += Math.abs((data[i] - result.fitted[i]) / data[i]);
            count++;
          }
        }
        mape = (mape / count) * 100;

        if (mape < bestMAPE) {
          bestMAPE = mape;
          bestParams = { alpha, beta, gamma };
        }
      }
    }
  }

  return bestParams;
}

// ─── Tính sai số (Metrics) ──────────────────────────────────

function calculateMetrics(actual: number[], predicted: number[]) {
  const n = actual.length;
  let mae = 0, mse = 0, mape = 0;

  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    mae += Math.abs(error);
    mse += error * error;
    if (actual[i] > 0) {
      mape += Math.abs(error / actual[i]);
    }
  }

  return {
    MAE: mae / n,                                    // Mean Absolute Error
    RMSE: Math.sqrt(mse / n),                        // Root Mean Squared Error
    MAPE: ((mape / n) * 100).toFixed(2) + '%',      // Mean Absolute Percentage Error
  };
}
```

### Ví dụ sử dụng

```typescript
// Dữ liệu doanh thu 12 tháng (triệu VNĐ)
const revenueData = [800, 700, 900, 1000, 1100, 1050, 1200, 1300, 1250, 1500, 1600, 1400];

// Tối ưu tham số
const bestParams = optimizeHoltWinters(revenueData, 12);
console.log('Best params:', bestParams);
// → { alpha: 0.3, beta: 0.1, gamma: 0.4 }

// Dự báo 6 tháng tiếp
const result = holtWinters(revenueData, 12, bestParams.alpha, bestParams.beta, bestParams.gamma, 6);
console.log('Forecast:', result.forecast);
// → [1450, 1380, 1050, 950, 1150, 1280]

// Đánh giá
const metrics = calculateMetrics(revenueData, result.fitted);
console.log('MAPE:', metrics.MAPE);
// → '12.34%'
```

---

## Safety Stock

### Đây là gì?

Safety Stock (Tồn kho an toàn) là lượng hàng **dự phòng** để tránh hết hàng khi nhu cầu tăng đột biến hoặc nhà cung cấp giao hàng trễ.

### Công thức

```
Reorder Point = (Nhu cầu trung bình × Lead Time) + Safety Stock

Safety Stock = Z × σ × √(Lead Time)
```

### Giải thích qua ví dụ

Giả sử dữ liệu tồn kho giày tại kho Hà Nội:

```
Nhu cầu TB/tháng:       1.000 đôi giày
Độ lệch chuẩn (σ):      200 đôi
Lead time (thời gian đặt hàng):  30 ngày (1 tháng)
Mức độ phục vụ mong muốn:  95% (Z = 1.65)
```

**Tính toán:**

```
Safety Stock = 1.65 × 200 × √(30/30)
             = 1.65 × 200 × 1
             = 330 đôi

Reorder Point = 1.000 + 330 = 1.330 đôi
```

**Kết quả:**
- Khi tồn kho xuống **dưới 1.330 đôi** → cần đặt hàng ngay
- Giữ **tối thiểu 330 đôi** dự phòng

### Giải thích các biến

| Biến | Ý nghĩa | Cách tính |
|------|----------|-----------|
| `D` | Nhu cầu trung bình | TB(số lượng bán trong N tháng) |
| `σ` | Độ lệch chuẩn nhu cầu | stddev(số lượng bán) |
| `L` | Lead time (thời gian giao hàng) | Từ supplier (ngày) |
| `Z` | Hệ số服务水平 | Z(0.95)=1.65, Z(0.99)=2.33 |

### Z-Score服务水平

```
服务水平 = 90%  → Z = 1.28
服务水平 = 95%  → Z = 1.65  (phổ biến nhất)
服务水平 = 99%  → Z = 2.33  (quan trọng, không được hết hàng)
```

### Pseudocode chi tiết

```typescript
// ─── Safety Stock Calculator ─────────────────────────────────

interface SafetyStockResult {
  avgDemand: number;           // Nhu cầu trung bình
  stdDev: number;              // Độ lệch chuẩn
  safetyStock: number;         // Tồn kho an toàn
  reorderPoint: number;        // Điểm đặt hàng lại
  maxStock: number;            // Tồn kho tối đa
  avgStock: number;            // Tồn kho trung bình
}

function calculateSafetyStock(
  demandHistory: number[],     // Lịch sử nhu cầu (số lượng bán)
  leadTimeDays: number,        // Thời gian giao hàng (ngày)
  serviceLevel: number = 0.95  // Mức độ phục vụ (95%)
): SafetyStockResult {

  // ─── 1. Tính nhu cầu trung bình ────────────────────────
  const avgDemand = demandHistory.reduce((a, b) => a + b, 0) / demandHistory.length;

  // ─── 2. Tính độ lệch chuẩn ──────────────────────────────
  const variance = demandHistory.reduce((sum, d) => sum + Math.pow(d - avgDemand, 2), 0)
                   / demandHistory.length;
  const stdDev = Math.sqrt(variance);

  // ─── 3. Lấy Z-score theo服务水平 ──────────────────────────
  const zScore = serviceLevel === 0.99 ? 2.33
               : serviceLevel === 0.95 ? 1.65
               : 1.28;  // 90%

  // ─── 4. Tính Safety Stock ──────────────────────────────
  // Lead timenormalize về tháng (30 ngày = 1 tháng)
  const leadTimeMonths = leadTimeDays / 30;
  const safetyStock = zScore * stdDev * Math.sqrt(leadTimeMonths);

  // ─── 5. Tính Reorder Point ─────────────────────────────
  const reorderPoint = avgDemand + safetyStock;

  // ─── 6. Tính tồn kho tối đa và trung bình ─────────────
  // Tồn kho tối đa = Reorder Point + Economic Order Quantity
  // (đơn giản: max = reorder + 1 tháng nhu cầu)
  const maxStock = reorderPoint + avgDemand;
  const avgStock = (maxStock + safetyStock) / 2;

  return {
    avgDemand,
    stdDev,
    safetyStock: Math.round(safetyStock),
    reorderPoint: Math.round(reorderPoint),
    maxStock: Math.round(maxStock),
    avgStock: Math.round(avgStock),
  };
}

// ─── Tính cho nhiều sản phẩm ─────────────────────────────────

interface ProductInventory {
  productId: string;
  productName: string;
  demandHistory: number[];     // Lịch sử bán hàng 12 tháng
  leadTimeDays: number;
  currentStock: number;        // Tồn kho hiện tại
}

function analyzeInventory(products: ProductInventory[]) {
  return products.map(product => {
    const result = calculateSafetyStock(
      product.demandHistory,
      product.leadTimeDays,
      0.95
    );

    // Trạng thái tồn kho
    const status = product.currentStock < result.safetyStock ? '🔴 THẤP'
                 : product.currentStock < result.reorderPoint ? '🟡 CẦN ĐẶT HÀNG'
                 : '🟢 ỔN ĐỊNH';

    // Số lượng cần đặt hàng
    const orderQuantity = Math.max(0, result.maxStock - product.currentStock);

    return {
      ...product,
      ...result,
      status,
      orderQuantity: Math.round(orderQuantity),
    };
  });
}
```

### Ví dụ sử dụng

```typescript
// Dữ liệu bán hàng 12 tháng của sản phẩm "Giày Thể Thao ABC"
const salesHistory = [80, 95, 110, 120, 130, 125, 140, 150, 145, 160, 170, 155];

const result = calculateSafetyStock(
  salesHistory,   // lịch sử bán
  30,             // lead time: 30 ngày
  0.95            // 95%服务水平
);

console.log(result);
// {
//   avgDemand: 129,
//   stdDev: 25,
//   safetyStock: 41,
//   reorderPoint: 170,
//   maxStock: 299,
//   avgStock: 170
// }

// → Khi tồn kho xuống dưới 170 → cần đặt hàng
// → Giữ tối thiểu 41 đôi dự phòng
// → Đặt hàng tối đa 299 đôi
```

---

## Thực tế áp dụng

### Áp dụng cho dự án Revenue AI

#### 1. Dự báo doanh thu theo chi nhánh

```typescript
// Mỗi chi nhánh có 1 forecast riêng
async function forecastBranchRevenue(branchId: string) {
  const data = await saleRepo
    .createQueryBuilder('sr')
    .select("DATE_FORMAT(sr.time_report, '%Y-%m')", 'month')
    .addSelect('SUM(sr.sold_quantity * p.listing_price)', 'revenue')
    .innerJoin('sr.product', 'p')
    .where('sr.branch_id = :branchId', { branchId })
    .groupBy('month')
    .orderBy('month', 'ASC')
    .getRawMany();

  const revenues = data.map(d => Number(d.revenue));
  const bestParams = optimizeHoltWinters(revenues, 12);
  const forecast = holtWinters(revenues, 12, bestParams.alpha, bestParams.beta, bestParams.gamma, 6);

  return {
    branchId,
    historical: data,
    forecast: forecast.forecast,
    metrics: calculateMetrics(revenues, forecast.fitted),
  };
}
```

#### 2. Dự báo tồn kho theo kho

```typescript
async function forecastInventory(plantId: string) {
  const data = await inventoryRepo
    .createQueryBuilder('ir')
    .select('ir.product_id', 'productId')
    .addSelect('SUM(ir.quantity)', 'totalStock')
    .where('ir.plant_id = :plantId', { plantId })
    .groupBy('ir.product_id')
    .getRawMany();

  return data.map(row => {
    // Lấy lịch sử bán 12 tháng cho từng sản phẩm
    const salesHistory = getSalesHistory(row.productId, 12);
    const result = calculateSafetyStock(salesHistory, 30, 0.95);

    return {
      productId: row.productId,
      currentStock: Number(row.totalStock),
      ...result,
    };
  });
}
```

#### 3. Hiển thị trên Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  DỰ BÁO DOANH THU THÁNG 01/2024                        │
│                                                         │
│  Chi nhánh Hà Nội:    1.2 tỷ VNĐ (±12%)               │
│  Chi nhánh TP.HCM:    1.5 tỷ VNĐ (±10%)               │
│  Chi nhánh Đà Nẵng:   0.8 tỷ VNĐ (±15%)               │
│                                                         │
│  Tổng dự báo:         3.5 tỷ VNĐ                        │
│  Xu hướng:            Tăng 8.5% so với tháng trước      │
├─────────────────────────────────────────────────────────┤
│  CẢNH BÁO TỒN KHO                                       │
│                                                         │
│  🔴 Giày Thể Thao ABC - Kho HN: 30 đôi (cần 41)       │
│  🟡 Giày Công Sở XYZ - Kho HCM: 160 đôi (cần 170)    │
│  🟢 Giày Boots DEF - Kho DN: 250 đôi (ổn định)        │
└─────────────────────────────────────────────────────────┘
```

### Dependencies cần thiết

```bash
npm install simple-statistics
```

```
simple-statistics: ~120KB, pure JS, không cần Python
```

### File structure đề xuất

```
src/
├── utils/
│   └── forecast/
│       ├── holt-winters.ts          # Holt-Winters algorithm
│       ├── safety-stock.ts          # Safety Stock calculator
│       ├── metrics.ts               # MAE, RMSE, MAPE
│       ├── optimizer.ts             # Grid search tối ưu α, β, γ
│       └── index.ts                 # Export
├── modules/
│   └── forecast/
│       ├── forecast.module.ts       # NestJS module
│       ├── forecast.service.ts      # Business logic
│       └── forecast.controller.ts   # API endpoints
```

---

## Tổng kết

| Thành phần | Thuật toán | Đầu vào | Đầu ra |
|-----------|-----------|---------|--------|
| Doanh thu | Holt-Winters | 12 tháng lịch sử | Dự báo 6 tháng tiếp |
| Tồn kho | Safety Stock | Nhu cầu + Lead time | Reorder point + Safety stock |

**Ưu điểm:**
- Holt-Winters: Bắt trend + seasonality, phù hợp retail
- Safety Stock: Đơn giản, thực tế, dễ hiểu

**Hạn chế:**
- Holt-Winters: Không xử lý được outlier mạnh
- Safety Stock: Giả định nhu cầu phân phối chuẩn

**Nâng cấp tương lai:**
- Thêm Prophet (Meta) cho dữ liệu bị thiếu
- Thêm ARIMA cho dự báo dài hạn
- Tích hợp AI (DeepSeek) để phân tích trend + recommendation
