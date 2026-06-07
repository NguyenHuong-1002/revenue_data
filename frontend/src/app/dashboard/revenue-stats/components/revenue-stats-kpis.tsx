'use client';

import {
  DollarSign,
  Activity,
  Award,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { RevenueKpis } from '../types';
import { getProductDisplayName } from '../utils';

interface RevenueStatsKpisProps {
  kpis: RevenueKpis;
}

/* ─────────────────────────────────────────────
   Shared card wrapper
───────────────────────────────────────────── */
function KpiCard({
  children,
  className,
  glowColor,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-md hover:border-border',
        className
      )}
    >
      {/* subtle corner glow */}
      {glowColor && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundColor: glowColor }}
        />
      )}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Icon badge
───────────────────────────────────────────── */
function IconBadge({ icon: Icon, className }: { icon: React.ElementType; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md',
        className
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */

export function RevenueStatsKpis({ kpis }: RevenueStatsKpisProps) {
  const isPositive = kpis.growthRate > 0;
  const isNeutral = kpis.growthRate === 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* ── KPI 1: Tổng doanh thu ── */}
      <KpiCard glowColor="rgba(var(--chart-2-rgb), 0.15)">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tổng doanh thu
          </p>
          <IconBadge icon={DollarSign} className="bg-emerald-600 text-white shadow-md" />
        </div>

        <div className="mt-4">
          <div className="text-2xl font-extrabold tracking-tight text-foreground">
            {new Intl.NumberFormat('vi-VN').format(kpis.totalRevenue)}
            <span className="ml-1 text-base font-semibold text-muted-foreground">đ</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {isNeutral ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                <Minus className="h-3 w-3" />
                Tháng đầu tiên
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold',
                    isPositive
                      ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? '+' : ''}
                  {kpis.growthRate}%
                </span>
                <span className="text-[10px] text-muted-foreground">so với tháng trước</span>
              </>
            )}
          </div>
        </div>

        {/* bottom accent bar */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-600" />
      </KpiCard>

      {/* ── KPI 2: Tốc độ tăng trưởng ── */}
      <KpiCard glowColor="rgba(var(--primary-rgb), 0.15)">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tốc độ tăng trưởng
          </p>
          <IconBadge icon={Activity} className="bg-primary text-primary-foreground shadow-md" />
        </div>

        <div className="mt-4">
          <div
            className={cn(
              'text-2xl font-extrabold tracking-tight',
              isNeutral
                ? 'text-muted-foreground'
                : isPositive
                  ? 'text-emerald-500'
                  : 'text-rose-500'
            )}
          >
            {isPositive ? '+' : ''}
            {kpis.growthRate}
            <span className="ml-0.5 text-base font-semibold">%</span>
          </div>

          {/* Mini progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                isPositive ? 'bg-emerald-600' : 'bg-rose-600'
              )}
              style={{ width: `${Math.min(Math.abs(kpis.growthRate), 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Hiệu suất xu hướng tháng gần nhất
          </p>
        </div>

        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
      </KpiCard>

      {/* ── KPI 3: Doanh thu cao nhất ── */}
      <KpiCard glowColor="rgba(var(--chart-3-rgb), 0.15)">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Doanh thu cao nhất
          </p>
          <IconBadge icon={Award} className="bg-amber-600 text-white shadow-md" />
        </div>

        <div className="mt-4 space-y-2">
          <p
            className="line-clamp-2 text-sm font-bold leading-snug text-foreground"
            title={getProductDisplayName(kpis.topProductByRevenue)}
          >
            {getProductDisplayName(kpis.topProductByRevenue)}
          </p>

          <div className="flex items-center justify-between border-t border-border/40 pt-2 flex-col">
            <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              #{kpis.topProductByRevenue.id || 'N/A'}
            </span>
            <span className="text-sm font-extrabold text-gray mt-4">
              {new Intl.NumberFormat('vi-VN').format(kpis.topProductByRevenue.revenue)} đ
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-amber-600" />
      </KpiCard>

      {/* ── KPI 4: Bán chạy nhất ── */}
      <KpiCard glowColor="rgba(var(--chart-4-rgb), 0.15)">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bán chạy nhất (SL)
          </p>
          <IconBadge icon={ShoppingBag} className="bg-chart-4 text-white shadow-md" />
        </div>

        <div className="mt-4 space-y-2">
          <p
            className="line-clamp-2 text-sm font-bold leading-snug text-foreground"
            title={getProductDisplayName(kpis.topProductByQuantity)}
          >
            {getProductDisplayName(kpis.topProductByQuantity)}
          </p>

          <div className="flex items-center justify-between border-t border-border/40 pt-2 flex-col">
            <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              #{kpis.topProductByQuantity.id || 'N/A'}
            </span>
            <span className="text-sm font-extrabold text-gray mt-4">
              {kpis.topProductByQuantity.quantity} sản phẩm
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-purple-600" />
      </KpiCard>
    </div>
  );
}
