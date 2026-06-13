# PLAN: Chuẩn hóa Logging — Thay `fs.appendFileSync` DIY bằng Winston

## Hiện trạng

| File | Ghi vào | Vấn đề |
|------|---------|--------|
| `global/file-logger.ts` | `logs/system.log` | Chỉ override `error()` + `warn()`, `log()` không vào file. Dùng `appendFileSync` đồng bộ. |
| `middlewares/api-logger.middleware.ts` | `logs/api.log` | Block event loop mỗi request |
| `global/all-exceptions.filter.ts` | `logs/error.log` | Block event loop mỗi exception |
| `middlewares/auth.guard.ts` | `logs/auth-debug.log` | `require('fs')` inline, không maintainable |
| `main.ts` | stdout | `console.log` startup message |

**Hậu quả**: 4 file log rời rạc, không correlation ID, không log rotation, không structured JSON, synchronous I/O block event loop.

## Mục tiêu

1. **1 Winston logger duy nhất** cho toàn bộ backend
2. **Async I/O** — không block event loop
3. **Log rotation** (daily, max 20MB/file, giữ 14 ngày)
4. **Structured JSON** (file) + colorized (console dev)
5. **Correlation ID** xuyên suốt request chain
6. **Log levels** đầy đủ: debug → info → warn → error

## Danh sách công việc

### Bước 1: Cài đặt dependencies

**File**: `backend/package.json`

Thêm vào `dependencies`:

```
winston@^3.17.0
winston-daily-rotate-file@^5.0.0
nestjs-winston@^11.0.0
```

Chạy:

```bash
cd backend
npm install winston@^3.17.0 winston-daily-rotate-file@^5.0.0 nestjs-winston@^11.0.0
```

---

### Bước 2: Tạo Winston Logger Config

**File mới**: `backend/src/global/logger.config.ts`

- Hàm `createWinstonLogger()` trả về config object
- **Transports**:
  - `Console`: level `debug`, format colorized + timestamp + prettyPrint
  - `DailyRotateFile` (app): level `info`, filename `logs/app-%DATE%.log`, datePattern `YYYY-MM-DD`, maxSize `20m`, maxFiles `14d`, format JSON
  - `DailyRotateFile` (error riêng): level `error`, filename `logs/error-%DATE%.log`, maxFiles `30d`, format JSON
- Format chung: `timestamp` + `context` + `message` + `stack` (nếu error)
- JSON format chứa: `{ timestamp, level, message, context, correlationId?, stack?, method?, url?, statusCode?, duration?, ip? }`

---

### Bước 3: Tạo Correlation ID Middleware

**File mới**: `backend/src/global/correlation-id.middleware.ts`

- `@Injectable()`, implements `NestMiddleware`
- Sinh UUID (từ package `uuid` đã có) cho mỗi request
- Lưu vào `AsyncLocalStorage` (có sẵn từ Node.js, không cần cài thêm)
- Attach vào response header `X-Correlation-Id`
- Gắn vào `request['correlationId']`
- Export `ALS` instance để Logger config có thể đọc correlationId

---

### Bước 4: Đăng ký Logger + Middleware vào AppModule

**File**: `backend/src/app.module.ts`

- Import `LoggerModule` từ `nestjs-winston` với config từ `logger.config.ts`
- Import `CorrelationIdMiddleware` và áp dụng global: `consumer.apply(CorrelationIdMiddleware).forRoutes('*')`
- Giữ nguyên `ApiLoggerMiddleware` (sẽ refactor ở bước 6)

---

### Bước 5: Sửa `main.ts`

**File**: `backend/src/main.ts`

```diff
- import { FileLogger } from './global/file-logger';
+ import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

- const app = await NestFactory.create<NestExpressApplication>(AppModule, {
-   logger: new FileLogger(),
- });
+ const app = await NestFactory.create<NestExpressApplication>(AppModule);

+ app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
```

- Xóa import `FileLogger`
- Xóa `console.log` startup, dùng `app.get(WINSTON_MODULE_NEST_PROVIDER).log(...)` thay thế

---

### Bước 6: Xóa `global/file-logger.ts`

**File**: `backend/src/global/file-logger.ts`

Xóa toàn bộ file (không còn dùng nữa).

---

### Bước 7: Refactor `middlewares/api-logger.middleware.ts`

**File**: `backend/src/middlewares/api-logger.middleware.ts`

- Inject `WINSTON_MODULE_NEST_PROVIDER` (hoặc `Logger` từ `@nestjs/common`)
- Xóa toàn bộ code `fs.appendFileSync`
- Log structured:
  - `info`: request hoàn thành (status < 400)
  - `warn`: status 4xx
  - `error`: status ≥ 500
  - Gồm: method, url, statusCode, duration, correlationId, ip

```ts
this.logger.log({
  message: `${method} ${url} ${statusCode} ${duration}ms`,
  method, url, statusCode, duration, correlationId, ip,
});
```

---

### Bước 8: Refactor `global/all-exceptions.filter.ts`

**File**: `backend/src/global/all-exceptions.filter.ts`

- Inject `Logger` (Winston) vào constructor
- Xóa import `appendFileSync`, `existsSync`, `mkdirSync` from `node:fs`
- Xóa hoàn toàn `writeLog()`, `createLogDir()`, `formatMessage()`, `getStack()`
- Log bằng `this.logger.error()`:
  - message: `exception.message`
  - stack: `exception.stack`
  - context: method + url + statusCode

---

### Bước 9: Refactor `middlewares/auth.guard.ts`

**File**: `backend/src/middlewares/auth.guard.ts`

- Inject `Logger` (Winston) vào constructor
- Xóa toàn bộ `require('fs')`, `fs.appendFileSync`
- Log SUCCESS bằng `this.logger.log()` (hoặc `debug`), FAILED bằng `this.logger.warn()`
- Giữ nguyên logic xác thực, roles, exception throwing

---

### Bước 10: Dọn dẹp & Kiểm tra

- Xóa thư mục `backend/logs/` (log cũ format khác)
- Chạy `npm run dev`, verify:
  - File `logs/app-YYYY-MM-DD.log` được tạo (JSON format)
  - File `logs/error-YYYY-MM-DD.log` được tạo khi gây exception
  - Console hiển thị colorized logs
  - Mỗi log entry có `correlationId`
  - Response header `X-Correlation-Id` xuất hiện
  - Auth SUCCESS/FAILED log ra file
  - Exception filter log ra file thay vì `appendFileSync`

## Tổng kết thay đổi

| Action | File | Chi tiết |
|--------|------|----------|
| ✏️ Sửa | `backend/package.json` | Thêm 3 dependencies |
| 🆕 Tạo | `backend/src/global/logger.config.ts` | Winston config với 3 transports |
| 🆕 Tạo | `backend/src/global/correlation-id.middleware.ts` | Correlation ID dùng AsyncLocalStorage |
| ✏️ Sửa | `backend/src/app.module.ts` | Import LoggerModule + CorrelationIdMiddleware |
| ✏️ Sửa | `backend/src/main.ts` | Dùng WinstonProvider, xóa console.log |
| 🗑️ Xóa | `backend/src/global/file-logger.ts` | Không còn dùng |
| ✏️ Sửa | `backend/src/middlewares/api-logger.middleware.ts` | Winston thay appendFileSync |
| ✏️ Sửa | `backend/src/global/all-exceptions.filter.ts` | Winston thay appendFileSync |
| ✏️ Sửa | `backend/src/middlewares/auth.guard.ts` | Winston thay appendFileSync |

**Tổng**: 9 files thay đổi (4 sửa + 2 tạo mới + 1 xóa + 1 sửa package.json + 1 sửa app.module.ts)

## So sánh trước-sau

| Tiêu chí | Trước | Sau |
|----------|-------|-----|
| I/O | Synchronous (block event loop) | Asynchronous |
| Format | Plain text | File: JSON, Console: colorized |
| Log rotation | ❌ | ✅ Daily, max 20MB, giữ 14-30 ngày |
| Correlation ID | ❌ | ✅ Mỗi request có ID duy nhất |
| Log levels | 2 (warn/error) | 4 (debug/info/warn/error) |
| File riêng lẻ | 4 file rời rạc | 2 file (app + error) + console |
| Searchable | Khó grep | JSON, dễ grep/query |
