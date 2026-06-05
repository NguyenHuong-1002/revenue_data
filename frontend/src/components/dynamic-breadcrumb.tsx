'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const pathMap: Record<string, string> = {
  '/': 'Trang chủ',
  '/dashboard': 'Bảng điều khiển',
  '/dashboard/accounts': 'Quản lý tài khoản',
  '/dashboard/branches': 'Quản lý chi nhánh',
  '/dashboard/chat': 'Trợ lý AI',
  '/dashboard/landing': 'Quản lý Landing Page',
  '/dashboard/notifications': 'Thông báo',
  '/dashboard/plants': 'Quản lý kho hàng',
  '/dashboard/products': 'Quản lý sản phẩm',
  '/dashboard/profile': 'Hồ sơ cá nhân',
  '/dashboard/report-inventory': 'Quản lý tồn kho',
  '/dashboard/report-sale': 'Quản lý doanh số',
  '/dashboard/reports': 'Báo cáo doanh thu',
  '/dashboard/revenue-stats': 'Thống kê doanh thu',
  '/dashboard/settings': 'Cài đặt hệ thống',
  '/dashboard/trend-forecast': 'Dự báo xu hướng',
  '/privacy': 'Chính sách bảo mật',
  '/terms': 'Điều khoản dịch vụ',
  '/auth': 'Xác thực',
  '/auth/login': 'Đăng nhập',
  '/auth/register': 'Đăng ký',
};

const segmentMap: Record<string, string> = {
  dashboard: 'Bảng điều khiển',
  accounts: 'Tài khoản',
  branches: 'Chi nhánh',
  chat: 'Trợ lý AI',
  landing: 'Landing Page',
  notifications: 'Thông báo',
  plants: 'Kho hàng',
  products: 'Sản phẩm',
  profile: 'Hồ sơ',
  'report-inventory': 'Tồn kho',
  'report-sale': 'Doanh số',
  reports: 'Báo cáo',
  'revenue-stats': 'Thống kê',
  settings: 'Cài đặt',
  'trend-forecast': 'Dự báo',
  privacy: 'Bảo mật',
  terms: 'Điều khoản',
  auth: 'Xác thực',
  login: 'Đăng nhập',
  register: 'Đăng ký',
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // On the home page, we do not show the breadcrumb since it's the root
  if (pathname === '/') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = [];

  // Always start with Home (Trang chủ)
  breadcrumbItems.push({
    label: 'Trang chủ',
    href: '/',
    isLast: segments.length === 0,
  });

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Check full path mapping first, then segment mapping, then fallback capitalization
    let label = pathMap[currentPath];
    if (!label) {
      label =
        segmentMap[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' ');
    }

    breadcrumbItems.push({
      label,
      href: currentPath,
      isLast,
    });
  });

  return (
    <Breadcrumb className="flex items-center">
      <BreadcrumbList className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-muted-foreground">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem className="flex items-center">
              {item.isLast ? (
                <BreadcrumbPage className="font-medium text-foreground max-w-[150px] sm:max-w-[240px] truncate">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {index === 0 && <HomeIcon className="h-3.5 w-3.5" />}
                    <span>{item.label}</span>
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator className="opacity-70" />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
