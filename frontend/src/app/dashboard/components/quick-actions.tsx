'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ShoppingBag, Boxes, Sparkles, ArrowUpRight } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-bold text-foreground/80 tracking-wide uppercase px-1">
        Phím tắt thao tác nhanh
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Nhập Excel Dữ Liệu */}
        <Link
          href="/dashboard/import"
          className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-foreground">Nhập Excel Dữ Liệu</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tải file và đối soát doanh số, sản phẩm
            </p>
          </div>
        </Link>

        {/* 2. Doanh số bán hàng */}
        <Link
          href="/dashboard/report-sale"
          className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-foreground">Báo Cáo Doanh Số</h3>
            <p className="text-xs text-muted-foreground mt-1">Xem chi tiết các giao dịch bán ra</p>
          </div>
        </Link>

        {/* 3. Quản lý Tồn kho */}
        <Link
          href="/dashboard/report-inventory"
          className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:border-blue-500/50 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Boxes className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-foreground">Báo Cáo Tồn Kho</h3>
            <p className="text-xs text-muted-foreground mt-1">Chi tiết tồn kho tại các nhà máy</p>
          </div>
        </Link>

        {/* 4. Dự báo xu hướng AI */}
        <Link
          href="/dashboard/trend-forecast"
          className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:border-purple-500/50 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[120px]"
        >
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/45 group-hover:text-purple-500 transition-colors" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-sm text-foreground">Phân Tích Xu Hướng</h3>
            <p className="text-xs text-muted-foreground mt-1">Dự đoán doanh số bằng mô hình AI</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
