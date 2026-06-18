# CODING RULES — Revenue Management System

Mục đích: Định nghĩa các quy tắc code style, cấu trúc project để đảm bảo tính liền mạch giữa Backend và Frontend.

---

## 1. Project Overview

```
revenue/
├── backend/           # NestJS 11 + TypeORM + MySQL
├── frontend/          # Next.js 16 + React 19 + Tailwind v4 + shadcn/ui
├── database/          # init.sql
├── data/              # Excel seed data
├── plant/             # Planning docs
├── docker-compose.yml
├── CODING_RULES.md    # File này
└── AGENTS.md          # CodeGraph instructions
```

---

## 2. File & Folder Naming

### 2.1 Quy tắc chung

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Folders | `kebab-case` | `sale-reports/`, `data-processing/` |
| TypeScript files | `kebab-case` | `product.service.ts`, `account.controller.ts` |
| React components | `kebab-case` (shared) | `app-sidebar.tsx`, `login-form.tsx` |
| React page components | `kebab-case` | `page.tsx`, `layout.tsx` |
| Custom hooks | `use-` prefix + `kebab-case` | `use-login.ts`, `use-mobile.ts` |
| Schema/validation files | `<entity>.schema.ts` | `login.schema.ts`, `products.schema.ts` |
| Type definition files | `<entity>.ts` | `account.ts`, `product.ts` |

### 2.2 Backend File Naming

| File type | Pattern | Ví dụ |
|-----------|---------|-------|
| Module | `<feature>.module.ts` | `product.module.ts` |
| Controller | `<feature>.controller.ts` | `product.controller.ts` |
| Service | `<feature>.service.ts` | `product.service.ts` |
| DTO (request) | `create-<entity>.dto.ts` | `create-product.dto.ts` |
| DTO (query) | `get-<entity>-all.dto.ts` | `get-product-all.dto.ts` |
| DTO (response) | `<entity>-response.dto.ts` | `product-response.dto.ts` |
| Interface | `<feature>.interface.ts` | `product.interface.ts` |
| Entity | `<entity>.entity.ts` | `product.entity.ts` |
| Swagger | `<feature>.swagger.ts` | `product.swagger.ts` |
| Filter | `<name>.filter.ts` | `all-exceptions.filter.ts` |
| Guard | `<name>.guard.ts` | `auth.guard.ts` |

### 2.3 Frontend File Naming

| File type | Pattern | Ví dụ |
|-----------|---------|-------|
| Shared component | `<name>.tsx` | `chart-card.tsx`, `app-sidebar.tsx` |
| Page component | `page.tsx` | `dashboard/page.tsx` |
| Layout | `layout.tsx` | `dashboard/layout.tsx` |
| Custom hook | `use-<name>.ts` | `use-login.ts` |
| Service | `<entity>.service.ts` | `account.service.ts` |
| Schema | `<entity>.schema.ts` | `login.schema.ts` |
| Type definition | `<entity>.ts` | `account.ts`, `product.ts` |

---

## 3. Backend Rules (NestJS)

### 3.1 Module Structure

```
modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.swagger.ts          # Tùy chọn, dùng khi có nhiều Swagger decorators
├── dto/                           # Luôn là lowercase "dto/"
│   ├── create-<entity>.dto.ts
│   ├── get-<entity>-all.dto.ts
│   └── <entity>-response.dto.ts
└── interfaces/
    └── <feature>.interface.ts
```

**QUY TẮC:**
- Folder DTO luôn là `dto/` (lowercase), KHÔNG dùng `DTO/`
- Interface folder luôn là `interfaces/`
- Entity file đặt tại `src/entities/<entity>.entity.ts` (không đặt trong module)

### 3.2 Pagination Model

**Standard: `page/limit` (KHÔNG dùng `skip/limit`)**

```typescript
// DTO standard
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

```typescript
// Response standard
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 3.3 Error Messages

**QUY TẮC: Luôn dùng tiếng Việt có dấu**

```typescript
// ✅ ĐÚNG
throw new BadRequestException('Mã sản phẩm không được để trống.');
throw new NotFoundException('Không tìm thấy tài khoản với ID này.');
throw new ConflictException('Tên đăng nhập đã tồn tại.');

// ❌ SAI
throw new BadRequestException('Product ID is required.');           // English
throw new NotFoundException('Account not found.');                   // English
throw new ConflictException('Username da ton tai');                  // Không dấu
throw new ConflictException('Username đã tồn tại!');                // Dùng ! không cần thiết
```

### 3.4 Controller Method Naming

**Pattern: `<verb><Entity>()` — Không thêm suffix "Controller"**

```typescript
// ✅ ĐÚNG
async getProducts(): Promise<IPaginatedProducts> { ... }
async getProductById(id: string): Promise<IProduct> { ... }
async createProduct(dto: CreateProductDto): Promise<IProduct> { ... }
async updateProduct(id: string, dto: UpdateProductDto): Promise<IProduct> { ... }
async deleteProduct(id: string): Promise<void> { ... }

// ❌ SAI
async getProductsController(): Promise<any> { ... }   // Không thêm "Controller"
async getAll(): Promise<any> { ... }                    // Quá ngắn, thiếu entity name
async getUsersAll(): Promise<any> { ... }               // Sai thứ tự word
```

### 3.5 DTO Validation Messages

**QUY TẮC: Luôn có message tiếng Việt có dấu**

```typescript
// ✅ ĐÚNG
@IsNotEmpty({ message: 'Mã sản phẩm không được để trống.' })
@IsString({ message: 'Mã sản phẩm phải là chuỗi ký tự.' })
@Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0.' })

// ❌ SAI
@IsNotEmpty({ message: 'Product ID is required.' })           // English
@IsNotEmpty({ message: 'Product ID khong duoc de trong!' })   // Không dấu
@IsNotEmpty()                                                  // Thiếu message
```

### 3.6 Response Type Annotations

**QUY TẮC: KHÔNG dùng `Promise<any>`**

```typescript
// ✅ ĐÚNG
@Get('stats')
async getProductStats(): Promise<IProductStats> {
  return this.productService.getStats();
}

// ❌ SAI
@Get('stats')
async getProductStats(): Promise<any> {
  return this.productService.getStats();
}
```

### 3.7 Swagger Documentation

**QUY TẮC: Dùng dedicated swagger file khi có nhiều decorator, hoặc inline khi ít**

- Nếu module có > 3 endpoints với Swagger decorators → tạo `<feature>.swagger.ts`
- Nếu module có ≤ 3 endpoints → inline trực tiếp trong controller

### 3.8 Auth Guard

**QUY TẮC: Mặc định tất cả routes đều cần auth, dùng `@authGuard.Public()` cho public routes**

```typescript
// ✅ ĐÚNG — Protected route (default)
@UseGuards(authGuard.AuthGuard)
@Controller('products')
export class ProductController { ... }

// ✅ ĐÚNG — Public route
@authGuard.Public()
@Get('landing')
getLandingData() { ... }

// ❌ SAI — Thiếu auth guard
@Controller('landing')      // Không có @UseGuards
export class LandingController { ... }
```

---

## 4. Frontend Rules (Next.js)

### 4.1 Component Structure

```typescript
// ✅ Named export cho shared components
export function ChartCard({ title, data }: ChartCardProps) {
  return <div>...</div>;
}

// ✅ Default export cho page components
export default function DashboardPage() {
  return <div>...</div>;
}
```

### 4.2 File Locations

| Loại | Location | Ví dụ |
|------|----------|-------|
| Shared components | `src/components/` | `src/components/app-sidebar.tsx` |
| UI primitives (shadcn) | `src/components/ui/` | `src/components/ui/button.tsx` |
| Landing components | `src/components/landing/` | `src/components/landing/hero.tsx` |
| Auth hooks | `src/lib/hooks/` | `src/lib/hooks/use-login.ts` |
| UI hooks | `src/hooks/` | `src/hooks/use-mobile.ts` |
| Auth schemas | `src/lib/schemas/` | `src/lib/schemas/login.schema.ts` |
| Feature schemas | Co-located with page | `src/app/dashboard/products/products.schema.ts` |
| Shared types | `src/lib/types/` | `src/lib/types/account.ts` |
| Feature types | Co-located with feature | `src/app/dashboard/revenue-stats/types.ts` |
| Services | `src/lib/services/` | `src/lib/services/account.service.ts` |
| Axios instance | `src/lib/axios.ts` | — |
| Utility functions | `src/lib/utils.ts` | — |

### 4.3 API Call Pattern

**QUY TẮC: Luôn dùng service layer, KHÔNG gọi trực tiếp axios trong component**

```typescript
// ✅ ĐÚNG — Service layer
// src/lib/services/chat.service.ts
export const chatService = {
  getSessions: () => api.get('/chat/sessions'),
  createSession: (data: CreateSessionDto) => api.post('/chat/sessions', data),
};

// Component
import { chatService } from '@/lib/services/chat.service';
const sessions = await chatService.getSessions();

// ❌ SAI — Direct API call in component
import { api } from '@/lib/axios';
const sessions = await api.get('/chat/sessions');
```

### 4.4 Import Ordering

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { toast } from 'sonner';
import { Edit, Trash2 } from 'lucide-react';

// 3. shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Shared lib (services, types, utils)
import { accountService } from '@/lib/services/account.service';
import { cn } from '@/lib/utils';

// 5. Local components / schemas
import { productsSchema } from './products.schema';
```

### 4.5 State Management

- Dùng `useState` / `useEffect` cho component-level state
- Dùng custom hooks cho shared logic (form, auth, etc.)
- KHÔNG dùng Redux/Zustand除非 project thực sự cần global state phức tạp

---

## 5. Cross-cutting Rules

### 5.1 Prettier (Unified)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false
}
```

**LƯU Ý:** `trailingComma: "all"` cho CẢ frontend và backend.

### 5.2 Import Ordering (ESLint)

```
builtin → external → internal (parent → sibling → index)
```

Alphabetized within each group, no blank lines between groups.

### 5.3 TypeScript

- `strict: true` cho cả frontend và backend
- `noImplicitAny: true` (nâng cấp từ `false` hiện tại ở backend)

### 5.4 Console.log

- **KHÔNG** dùng `console.log` trong production code
- Dùng `console.warn` / `console.error` khi cần thiết
- Backend: Dùng Winston logger (`this.logger.log()`, `this.logger.error()`)

---

## 6. Anti-patterns to Avoid

| # | Anti-pattern | Thay thế |
|---|-------------|----------|
| 1 | `Promise<any>` return type | Define typed interface |
| 2 | `console.log()` in production | Use Winston logger (BE) / remove (FE) |
| 3 | `import * as React from 'react'` | `import { useState, useEffect } from 'react'` |
| 4 | Direct `api.get()` in component | Use service layer |
| 5 | `skip/limit` pagination | Use `page/limit` |
| 6 | Error messages in English | Use Vietnamese with diacritics |
| 7 | `DTO/` folder (uppercase) | Use `dto/` (lowercase) |
| 8 | Inline types in service files | Move to `interfaces/` or `types/` |
| 9 | Missing `@UseGuards` on protected routes | Always add auth guard |
| 10 | `any` type assertions | Use proper type definitions |

---

## 7. Migration Checklist

Khi refactor code cũ để tuân thủ rules mới:

- [ ] Rename `DTO/` folders → `dto/` (lowercase)
- [ ] Convert `skip/limit` pagination → `page/limit`
- [ ] Update error messages → Vietnamese with diacritics
- [ ] Standardize controller method names
- [ ] Add return type annotations (remove `Promise<any>`)
- [ ] Move inline types to dedicated files
- [ ] Remove `console.log` statements
- [ ] Ensure all protected routes have auth guard
- [ ] Unify Prettier config (`trailingComma: "all"`)
- [ ] Delete unused `src/models/` directory (legacy)
- [ ] Delete empty `src/lib/data/` directory (frontend)
