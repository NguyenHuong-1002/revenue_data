# Backend Architecture Improvements Report

> Ngày tạo: 2026-06-26
> Framework: NestJS 11 + TypeORM + MySQL

---

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Danh Sách Tất Cả Các Cải Thiện](#danh-sách-tất-cả-các-cải-thiện)
3. [Vấn Đề Nghiêm Trọng (High Priority)](#vấn-đề-nghiêm-trọng)
4. [Vấn Đề Trung Bình (Medium Priority)](#vấn-đề-trung-bình)
5. [Vấn Đề Thấp (Low Priority)](#vấn-đề-thấp)
6. [Cấu Trúc Khuyến Nghị](#cấu-trúc-khuyến-nghị)
7. [Chi Tiết Từng Cải Thiện](#chi-tiết-từng-cải-thiện)
8. [Thứ Tự Cải Thiện](#thứ-tự-cải-thiện)

---

## Tổng Quan

Dự án backend sử dụng NestJS với cấu trúc module-based, tuy nhiên tồn tại một số vấn đề về tính nhất quán, bảo mật và maintainability.

---

## Danh Sách Tất Cả Các Cải Thiện

| STT | Cải Thiện | Mô Tả Ngắn | Ưu Tiên | Trạng Thái |
|-----|-----------|-------------|---------|------------|
| 1 | Truy cập DB không đồng nhất | Products dùng raw SQL, các module khác dùng TypeORM | High | ⏳ Pending |
| 2 | Entities không theo module | Tất cả entities nằm trong `src/entities/` thay vì theo module | High | ⏳ Pending |
| 3 | Thiếu ConfigModule | Truy cập `process.env` trực tiếp, không validate env vars | High | ⏳ Pending |
| 4 | CORS quá mở | `origin: true` cho phép mọi origin truy cập API | High | ⏳ Pending |
| 5 | Thiếu Health Check | Không có endpoint kiểm tra sức khỏe hệ thống | Medium | ⏳ Pending |
| 6 | Thiếu Interceptors | Không có response transformation, caching, logging | Medium | ⏳ Pending |
| 7 | Thiếu Shared/Common Module | Code duplication, không có module chung | Medium | ⏳ Pending |
| 8 | Naming không nhất quán | Files dùng singular, directories dùng plural | Medium | ⏳ Pending |
| 9 | Module import không cần thiết | DataProcessingModule không có controller nhưng vẫn import | Medium | ⏳ Pending |
| 10 | Thiếu Tests | Không tìm thấy file test `.spec.ts` | Low | ⏳ Pending |
| 11 | Thiếu Environment Validation | Không validate env vars bắt buộc khi startup | Low | ⏳ Pending |
| 12 | Global Guard không register đúng | AuthGuard apply ở controller level thay vì global | Low | ⏳ Pending |
| 13 | Middleware folder sai tên | Thư mục `middlewares/` chứa Guards, nên đổi thành `guards/` | Low | ⏳ Pending |
| 14 | Đổi tên files theo convention | Nên dùng plural cho consistency (accounts, products) | Low | ⏳ Pending |

---

## Vấn Đề Nghiêm Trọng

### 1. Truy Cập Database Không Đồng Nhất

**Mô tả:** Dự án sử dụng 2 cách truy cập database khác nhau gây khó maintain.

| Module | Phương Thức | Vị Trí |
|--------|-------------|--------|
| Accounts | TypeORM Repository | `account.service.ts` |
| Branches | TypeORM Repository | `branch.service.ts` |
| Plants | TypeORM Repository | `plant.service.ts` |
| Notifications | TypeORM Repository | `notification.service.ts` |
| **Products** | **Raw SQL queries** | `product.service.ts:16-89` |
| **Reports** | **Raw SQL queries** | `reports.service.ts` |

**Vấn đề:**
- Code không nhất quán, dễ gây confusion
- Raw SQL dễ bị SQL injection nếu không cẩn thận
- Khó test và refactor

**Khuyến nghị:** Chuyển tất cả modules sang TypeORM Repository pattern.

---

### 2. Entities Không Theo Module

**Mô tả:** Tất cả entities nằm trong thư mục `src/entities/` thay vì theo module riêng.

```
src/entities/
├── account.entity.ts          # Nên ở modules/accounts/
├── account-notification.entity.ts
├── branch.entity.ts           # Nên ở modules/branches/
├── chat-message.entity.ts
├── chat-session.entity.ts
├── inventory-report.entity.ts
├── landing-ai-insight.entity.ts
├── landing-feature.entity.ts
├── landing-testimonial.entity.ts
├── notification.entity.ts     # Nên ở modules/notifications/
├── plant.entity.ts            # Nên ở modules/plants/
├── product.entity.ts          # Nên ở modules/products/
└── sale-report.entity.ts
```

**Vấn đề:**
- Vi phạm nguyên tắc self-contained modules
- Khó tìm và manage entities khi project lớn
- Dependency confusion

**Khuyến nghị:** Di chuyển entity vào thư mục module tương ứng.

---

### 3. Thiếu ConfigModule và Environment Validation

**Mô tả:** Truy cập `process.env` trực tiếp mà không validate.

**Vị trí:**
- `src/config/typeorm.config.ts:5-9`
- `src/main.ts:38`
- `src/models/database.service.ts:24-27`

**Vấn đề:**
- Không validate env vars khi startup
- Dễ gây lỗi runtime khi thiếu env
- Không type-safe

**Khuyến nghị:** Sử dụng `@nestjs/config` với Joi validation.

---

### 4. CORS Quá Mở

**Mô tả:** CORS được cấu hình cho phép mọi origin.

**Vị trí:** `src/main.ts:32-36`

```typescript
app.enableCors({
  origin: true,  // ← Cho phép MỌI origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

**Vấn đề:**
- Lỗ hổng bảo mật nghiêm trọng
- Cho phép bất kỳ website nào gọi API

**Khuyến nghị:** Chỉ định cụ thể các origin được phép.

---

## Vấn Đề Trung Bình

### 5. Thiếu Health Check Endpoint

**Mô tả:** Không có endpoint kiểm tra sức khỏe hệ thống.

**Vấn đề:**
- Khó monitor khi deploy
- Load balancer không check được status

**Khuyến nghị:** Thêm `@nestjs/terminus` cho health checks.

---

### 6. Thiếu Interceptors

**Mô tả:** Không có interceptors cho response transformation.

**Vấn đề:**
- Response format không nhất quán
- Không có caching layer
- Không có response transformation

**Khuyến nghị:** Thêm interceptors:
- `TransformInterceptor` - wrap response
- `CacheInterceptor` - caching
- `LoggingInterceptor` - logging

---

### 7. Thiếu Shared/Common Module

**Mô tả:** Không có module chung cho các service thường dùng.

**Vấn đề:**
- Code duplication giữa các modules
- Mỗi module tự implement pagination logic

**Khuyến nghị:** Tạo `CommonModule` với:
- Base DTOs (pagination, search)
- Common services (notification, file upload)
- Shared guards/interceptors

---

### 8. Naming Không Nhất Quán

**Mô tả:** Một số modules dùng singular, một số dùng plural.

| Module | Tên File | Tên Directory |
|--------|----------|---------------|
| Accounts | `account.module.ts` | `accounts/` |
| Products | `product.module.ts` | `products/` |
| Branches | `branch.module.ts` | `branches/` |

**Khuyến nghị:** Chọn một convention và áp dụng nhất quán (khuyên dùng plural).

---

### 9. Module Import Không Cần Thiết

**Mô tả:** `DataProcessingModule` không có controller nhưng vẫn import vào AppModule.

**Vị trí:** `src/app.module.ts:6`

```typescript
import { DataProcessingModule } from './modules/data-processing/data-processing.module';
```

**Vấn đề:**
- Nếu module chỉ export service, không cần import vào root module
- Tăng startup time không cần thiết

**Khuyến nghị:** Chỉ import modules có controllers hoặc cần initialize global.

---

## Vấn Đề Thấp

### 10. Thiếu Tests

**Mô tả:** Không tìm thấy file test `.spec.ts`.

**Vấn đề:**
- Không có regression testing
- Khó refactor an toàn

**Khuyến nghị:** Thêm unit tests cho services và e2e tests cho APIs.

---

### 11. Thiếu Environment Variables Validation

**Mô tả:** Không validate các env vars bắt buộc khi startup.

**Vấn đề:**
- App có thể chạy với config thiếu
- Lỗi chỉ xuất hiện khi gọi endpoint

**Khuyến nghị:** Validate với Joi hoặc class-validator ở startup.

---

### 12. Global Guard Không Register Đúng Cách

**Mô tả:** AuthGuard được apply ở controller level thay vì global.

**Vị trí:** Mỗi controller đều có `@UseGuards(authGuard.AuthGuard)`

**Vấn đề:**
- Code duplication
- Dễ quên khi tạo controller mới

**Khuyến nghị:** Register AuthGuard globally trong `main.ts`.

---

### 13. Middleware Folder Nên Đổi Tên

**Mô tả:** Thư mục `middlewares/` chứa Guards, nên đổi thành `guards/`.

**Vị trí:** `src/middlewares/auth.guard.ts`

**Vấn đề:**
- NestJS convention: Guards ở `guards/`, Middleware ở `middleware/`
- Gây confusion

**Khuyến nghị:** Tách thành `guards/` và `middleware/`.

---

### 14. Đổi Tên Files Theo Convention

**Mô tả:** Nên dùng plural cho consistency.

| Hiện Tại | Khuyến Nghị |
|-----------|-------------|
| `account.module.ts` | `accounts.module.ts` |
| `product.module.ts` | `products.module.ts` |
| `branch.module.ts` | `branches.module.ts` |

**Khuyến nghị:** Đổi tên files theo convention plural.

---

## Cấu Trúc Khuyến Nghị

```
backend/src/
├── main.ts
├── app.module.ts
├── config/
│   ├── configuration.ts          # ← Thêm: Validate env vars
│   └── validation.schema.ts      # ← Thêm: Joi schema
├── common/                       # ← Thêm: Shared module
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   └── search.dto.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── middleware/
│   │   ├── correlation-id.middleware.ts
│   │   └── api-logger.middleware.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   └── common.module.ts
├── modules/
│   ├── accounts/
│   │   ├── entities/
│   │   │   └── account.entity.ts
│   │   ├── dto/
│   │   ├── interfaces/
│   │   ├── guards/
│   │   ├── accounts.module.ts
│   │   ├── accounts.controller.ts
│   │   └── accounts.service.ts
│   ├── products/
│   │   ├── entities/
│   │   │   └── product.entity.ts
│   │   ├── dto/
│   │   ├── interfaces/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   └── products.service.ts     # ← Chuyển sang TypeORM
│   ├── branches/
│   │   └── ... (tương tự)
│   ├── notifications/
│   │   └── ... (tương tự)
│   └── ... (các modules khác)
├── health/                       # ← Thêm: Health check
│   ├── health.module.ts
│   └── health.controller.ts
├── database/
│   ├── database.module.ts
│   ├── database.service.ts
│   └── migrations/
└── assets/
```

---

## Chi Tiết Từng Cải Thiện

### Cải Thiện 1: Thêm ConfigModule

**File tạo mới:** `src/config/configuration.ts`

```typescript
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  jwt: {
    secret: process.env.ACCESS_TOKEN_JWT,
    expiresIn: '7d',
  },
});
```

**Cài đặt:**
```bash
npm i joi
```

---

### Cải Thiện 2: Sửa CORS

**File:** `src/main.ts`

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    // Thêm production origins
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

---

### Cải Thiện 3: Chuyển Products Sang TypeORM

**File:** `src/modules/products/product.service.ts`

```typescript
// Thay thế raw SQL bằng TypeORM Repository
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getProductsAll(filters: GetProductAllDto): Promise<IPaginatedProducts> {
    const { page, limit, ...whereFilters } = filters;
    const [data, total] = await this.productRepository.findAndCount({
      where: whereFilters,
      order: { product_id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
```

---

### Cải Thiện 4: Thêm Health Check

**Cài đặt:**
```bash
npm install @nestjs/terminus
```

**File tạo mới:** `src/health/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

---

### Cải Thiện 5: Register Global Guard

**File:** `src/main.ts`

```typescript
import { AuthGuard } from './common/guards/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global guard
  app.useGlobalGuards(app.get(AuthGuard));

  // ...
}
```

---

### Cải Thiện 6: Tạo Shared CommonModule

**File tạo mới:** `src/common/common.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { NotificationModule } from '../modules/notifications/notification.module';

@Global()
@Module({
  imports: [NotificationModule],
  exports: [NotificationModule],
})
export class CommonModule {}
```

---

## Thứ Tự Cải Thiện

| Ưu Tiên | Cải Thiện | Thời Gian Dự Kiến |
|---------|-----------|-------------------|
| 1 | Thêm ConfigModule + Env Validation | 2 giờ |
| 2 | Sửa CORS configuration | 15 phút |
| 3 | Chuyển Products sang TypeORM | 3 giờ |
| 4 | Di chuyển entities vào modules | 2 giờ |
| 5 | Thêm Health Check | 1 giờ |
| 6 | Register Global Guard | 30 phút |
| 7 | Tạo CommonModule | 1 giờ |
| 8 | Thêm Interceptors | 2 giờ |
| 9 | Đổi tên middlewares/ → guards/ + middleware/ | 30 phút |
| 10 | Xóa DataProcessingModule khỏi AppModule | 15 phút |
| 11 | Đổi tên files theo convention plural | 1 giờ |
| 12 | Thêm Tests | 4 giờ |

---

## Kết Luận

Dự án có kiến trúc cơ bản đúng với NestJS conventions, tuy nhiên cần cải thiện để:
- Tính nhất quán trong truy cập database
- Bảo mật (CORS)
- Maintainability (entity organization, shared module)
- Developer experience (Health Check)

Tổng thời gian cải thiện ước tính: **~17.5 giờ**
