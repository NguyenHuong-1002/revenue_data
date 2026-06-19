# PLAN.md - Kế hoạch tích hợp React Query

## Tổng quan hiện trạng

### Hiện tại (Manual State Management)
```tsx
const [data, setData] = useState<Type[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const fetchData = useCallback(async () => {
  setIsLoading(true);
  try {
    const res = await someService.list(params);
    setData(res.data.data);
  } catch (error) {
    toast.error('Lỗi');
  } finally {
    setIsLoading(false);
  }
}, [deps]);

useEffect(() => { fetchData(); }, [fetchData]);
```

### Sau khi tích hợp (React Query)
```tsx
const { data, isLoading, error } = useBranches({ page, limit });
const branches = data?.data ?? [];
```

---

## Bước 1: Cài đặt package

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

## Bước 2: Tạo QueryClient Provider

**File mới:** `src/lib/query-provider.tsx`

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,      // 1 phút
            gcTime: 5 * 60 * 1000,     // 5 phút
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Sửa:** `src/app/layout.tsx`

```tsx
// Thêm import
import { QueryProvider } from '@/lib/query-provider';

// Wrap QueryProvider quanh ThemeProvider
<QueryProvider>
  <ThemeProvider ...>
    {children}
  </ThemeProvider>
</QueryProvider>
```

---

## Bước 3: Unwrap Axios responses trong services

Hiện tại most services trả về toàn bộ Axios response. Cần unwrap để React Query nhận trực tiếp data.

**Ví dụ:** `branch.service.ts`

```ts
// TRƯỚC
async list(params?: BranchListParams) {
  return api.get<BranchListResponse>('/branches', { params });
}

// SAU
async list(params?: BranchListParams) {
  const res = await api.get<BranchListResponse>('/branches', { params });
  return res.data;
}
```

### Danh sách services cần sửa

| Service | File | Methods cần unwrap |
|---------|------|-------------------|
| account | `account.service.ts` | list, search, me, getById |
| branch | `branch.service.ts` | list, getById |
| plant | `plant.service.ts` | list, getById |
| product | `product.service.ts` | list, getById, stats |
| sale-report | `sale-report.service.ts` | list, get, getStats, getRevenueStats |
| inventory-report | `inventory-report.service.ts` | list, get, getStats, getAlerts |
| settings | `settings.service.ts` | getAll, getByKey |
| notification | `notification.service.ts` | getAll |
| import | `import.service.ts` | importProducts, importSales, importInventory |
| report | `report.service.ts` | (giữ nguyên - trả Blob) |
| landing | `landing.service.ts` | (đã unwrap sẵn) |

---

## Bước 4: Tạo custom hooks cho từng entity

**Thư mục mới:** `src/lib/hooks/queries/`

```
src/lib/hooks/
├── queries/
│   ├── index.ts              // Export tất cả hooks
│   ├── use-accounts.ts
│   ├── use-branches.ts
│   ├── use-plants.ts
│   ├── use-products.ts
│   ├── use-sale-reports.ts
│   ├── use-inventory-reports.ts
│   ├── use-settings.ts
│   ├── use-notifications.ts
│   └── use-reports.ts
├── use-login.ts              (giữ nguyên)
├── use-logout.ts             (giữ nguyên)
└── use-register.ts           (giữ nguyên)
```

### Template hook cho mỗi entity

```ts
// use-branches.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchService } from '@/lib/services/branch.service';
import type { BranchListParams, CreateBranchDto, UpdateBranchDto } from '@/lib/types/branch';

// ===== Query Keys =====
export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...branchKeys.lists(), params] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
};

// ===== Queries =====
export function useBranches(params?: BranchListParams) {
  return useQuery({
    queryKey: branchKeys.list(params ?? {}),
    queryFn: () => branchService.list(params),
  });
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => branchService.getById(id),
    enabled: !!id,
  });
}

// ===== Mutations =====
export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchDto) => branchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchDto }) =>
      branchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}
```

---

## Bước 5: Refactor components (từng trang)

### Thứ tự refactor

| # | Trang | Route | API calls | Độ phức tạp |
|---|-------|-------|-----------|------------|
| 1 | Chi nhánh | `/dashboard/branches` | 5 | Thấp |
| 2 | Kho | `/dashboard/plants` | 5 | Thấp |
| 3 | Sản phẩm | `/dashboard/products` | 6 | Trung bình |
| 4 | Tài khoản | `/dashboard/accounts` | 7 | Trung bình |
| 5 | Doanh thu | `/dashboard/revenue-stats` | 4 | Thấp |
| 6 | Tồn kho | `/dashboard/inventory-stats` | 4 | Thấp |
| 7 | BC bán hàng | `/dashboard/report-sale` | 6 | Trung bình |
| 8 | BC tồn kho | `/dashboard/report-inventory` | 6 | Trung bình |
| 9 | Thông báo | `/dashboard/notifications` | 3 | Thấp |
| 10 | Cài đặt | `/dashboard/settings` | 5 | Thấp |
| 11 | Dashboard chính | `/dashboard` | 6 | Cao |
| 12 | Import | `/dashboard/import` | 3 | Cao |

### Mẫu refactor

```tsx
// TRƯỚC: branches/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { branchService } from '@/lib/services/branch.service';
import { toast } from 'sonner';

export default function BranchesPage() {
  const [data, setData] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await branchService.list({ page, limit: 10 });
      setData(res.data.data);
    } catch {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    await branchService.remove(id);
    fetchData();
    toast.success('Đã xóa');
  };

  // ... render
}

// SAU
'use client';
import { useBranches, useDeleteBranch } from '@/lib/hooks/queries/use-branches';
import { toast } from 'sonner';

export default function BranchesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBranches({ page, limit: 10 });
  const deleteBranch = useDeleteBranch();

  const branches = data?.data ?? [];

  const handleDelete = (id: string) => {
    deleteBranch.mutate(id, {
      onSuccess: () => toast.success('Đã xóa'),
      onError: () => toast.error('Lỗi xóa'),
    });
  };

  if (isLoading) return <BranchesSkeleton />;

  // ... render
}
```

---

## Bước 6: Special Cases

### a) Auth (login/register/logout)
Giữ nguyên hooks hiện tại, KHÔNG dùng React Query.

### b) File uploads (import)
```ts
export function useImportProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return importService.importProducts(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
```

### c) PDF/Excel exports
```ts
export function useExportRevenuePdf() {
  return useMutation({
    mutationFn: (params: ReportParams) => reportService.exportRevenuePdf(params),
  });
}
```

### d) Notifications polling
```ts
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationService.getAll(),
    refetchInterval: 60 * 1000, // Poll mỗi 60s
  });
}
```

---

## Bước 7: Cấu hình Global Options

**File:** `src/lib/query-client.ts`

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // Data stale sau 1 phút
      gcTime: 5 * 60 * 1000,      // Garbage collect sau 5 phút
      refetchOnWindowFocus: false, // Không refetch khi focus lại window
      retry: 1,                    // Retry 1 lần khi fail
    },
  },
});
```

---

## Danh sách files mới cần tạo

| File | Mô tả |
|------|-------|
| `src/lib/query-provider.tsx` | QueryProvider component |
| `src/lib/query-client.ts` | QueryClient config |
| `src/lib/hooks/queries/index.ts` | Export barrel |
| `src/lib/hooks/queries/use-accounts.ts` | Account hooks |
| `src/lib/hooks/queries/use-branches.ts` | Branch hooks |
| `src/lib/hooks/queries/use-plants.ts` | Plant hooks |
| `src/lib/hooks/queries/use-products.ts` | Product hooks |
| `src/lib/hooks/queries/use-sale-reports.ts` | Sale report hooks |
| `src/lib/hooks/queries/use-inventory-reports.ts` | Inventory report hooks |
| `src/lib/hooks/queries/use-settings.ts` | Settings hooks |
| `src/lib/hooks/queries/use-notifications.ts` | Notification hooks |
| `src/lib/hooks/queries/use-reports.ts` | Export hooks |

## Files cần sửa

| File | Thay đổi |
|------|----------|
| `src/app/layout.tsx` | Wrap QueryProvider |
| `src/lib/services/*.ts` | Unwrap axios response |
| `src/app/dashboard/*/page.tsx` | Refactor sang React Query hooks |

---

## Checklist hoàn thành

- [ ] Cài đặt `@tanstack/react-query` + devtools
- [ ] Tạo `query-provider.tsx` + `query-client.ts`
- [ ] Wrap `QueryProvider` trong `layout.tsx`
- [ ] Unwrap responses trong 11 services
- [ ] Tạo custom hooks cho 9 entities
- [ ] Refactor trang branches
- [ ] Refactor trang plants
- [ ] Refactor trang products
- [ ] Refactor trang accounts
- [ ] Refactor trang revenue-stats
- [ ] Refactor trang inventory-stats
- [ ] Refactor trang report-sale
- [ ] Refactor trang report-inventory
- [ ] Refactor trang notifications
- [ ] Refactor trang settings
- [ ] Refactor trang dashboard chính
- [ ] Refactor trang import
- [ ] Chạy lint + typecheck
- [ ] Test toàn bộ trang
