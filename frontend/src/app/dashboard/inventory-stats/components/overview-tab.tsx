'use client';

import * as React from 'react';
import { useId } from 'react';
import { Factory, Package, TrendingUp, TrendingDown, Minus, TrendingUpIcon } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ChartCard as SharedChartCard } from '@/components/charts/chart-card';
import { ChartZoomDialog, useChartZoom } from '@/components/charts/chart-zoom';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AXIS_TICK_CLASS,
  BAR_RADIUS,
  BAR_SIZE,
  CHART_COLORS,
  CURSOR_STYLE,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';
import { cn } from '@/lib/utils';
import { Kpis, Rankings, TimeRange, PLANT_COLORS, GROWTH_LABEL, fmtNum, fmtMonth } from './types';
import { HighlightCard, RankRow, EmptyState } from './shared-ui';

const trendChartConfig = {
  total: { label: 'Tồn kho', color: CHART_COLORS.chart4 },
} satisfies ChartConfig;

const plantsChartConfig = {
  total: { label: 'Tồn kho', color: CHART_COLORS.chart1 },
} satisfies ChartConfig;

interface Props {
  kpis: Kpis | null;
  rankings: Rankings | null;
  timeRange: TimeRange;
  productMap: Record<string, string>;
  plantMap: Record<string, string>;
}

export function OverviewTab({ kpis, rankings, timeRange, productMap, plantMap }: Props) {
  const reactId = useId();
  const trendGradId = `inv-trend-grad-${reactId.replace(/:/g, '')}`;

  const trendZoom = useChartZoom();
  const plantsZoom = useChartZoom();

  if (!kpis) return <EmptyState message="Không có dữ liệu KPI" />;

  // Tính growthPercent từ monthlyTrend để phản ánh đúng khoảng lọc
  const trend = rankings?.monthlyTrend ?? [];
  let computedGrowth: number | null = null;
  if (trend.length >= 2) {
    const first = trend[0].total;
    const last = trend[trend.length - 1].total;
    computedGrowth = first === 0 ? null : Math.round(((last - first) / first) * 1000) / 10;
  } else if (kpis.growthPercent !== null) {
    computedGrowth = kpis.growthPercent;
  }

  const growthValue = computedGrowth;
  const isPositive = (growthValue ?? 0) > 0;
  const isNeutral = growthValue === null || growthValue === 0;

  const trendChart = rankings?.monthlyTrend ? (
    <ChartContainer config={trendChartConfig} className="h-full w-full">
      <AreaChart data={rankings.monthlyTrend}>
        <defs>
          <linearGradient id={trendGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.chart4} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.chart4} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray={GRID_DASH} className={GRID_CLASS} />
        <XAxis
          dataKey="month"
          tickFormatter={fmtMonth}
          tickLine={false}
          axisLine={false}
          tickMargin={TICK_MARGIN}
          className={AXIS_TICK_CLASS}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={TICK_MARGIN}
          tickFormatter={(v) => fmtNum(v)}
          className={AXIS_TICK_CLASS}
        />
        <ChartTooltip
          cursor={CURSOR_STYLE}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => fmtMonth(String(label ?? ''))}
              formatter={(value, _name, item) => {
                const g = (item?.payload as { growthPct: number | null } | undefined)?.growthPct;
                return (
                  <div className="space-y-0.5">
                    <div className="font-semibold text-foreground">
                      Tồn kho: <span className="font-mono">{fmtNum(value as number)}</span> chiếc
                    </div>
                    {g !== null && g !== undefined && (
                      <div
                        className={cn(
                          'font-semibold text-[11px]',
                          g >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        )}
                      >
                        Tăng trưởng: {g >= 0 ? '+' : ''}
                        {g}%
                      </div>
                    )}
                  </div>
                );
              }}
              hideLabel
            />
          }
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={CHART_COLORS.chart4}
          strokeWidth={2}
          fill={`url(#${trendGradId})`}
        />
      </AreaChart>
    </ChartContainer>
  ) : null;

  const plantsBarChart = rankings?.topPlants ? (
    <div className="h-full w-full">
      <ChartContainer config={plantsChartConfig} className="h-full w-full">
        <BarChart data={rankings.topPlants.slice(0, 8)} layout="vertical">
          <CartesianGrid horizontal={false} strokeDasharray={GRID_DASH} className={GRID_CLASS} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickMargin={TICK_MARGIN}
            className={AXIS_TICK_CLASS}
            tickFormatter={fmtNum}
          />
          <YAxis
            dataKey="plant_id"
            type="category"
            tickLine={false}
            axisLine={false}
            width={80}
            className="text-[10px] fill-foreground font-semibold"
          />
          <ChartTooltip
            cursor={CURSOR_STYLE}
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono">{fmtNum(value as number)} chiếc</span>
                )}
                hideLabel
              />
            }
          />
          <Bar dataKey="total" radius={BAR_RADIUS.horizontal} barSize={BAR_SIZE.lg}>
            {rankings.topPlants.slice(0, 8).map((_, i) => (
              <Cell key={i} fill={PLANT_COLORS[i % PLANT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI Hero Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tổng tồn kho — hero card */}
        <div className="sm:col-span-2 lg:col-span-1 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Tổng tồn kho
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <p className="text-4xl font-extrabold tracking-tight text-foreground">
            {fmtNum(kpis.totalStock)}
          </p>
          <p className="text-sm text-muted-foreground">sản phẩm trong kho</p>
        </div>

        {/* Tăng trưởng */}
        <div
          className={cn(
            'rounded-2xl border p-6 shadow-sm flex flex-col gap-2',
            isPositive
              ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5'
              : isNeutral
                ? 'border-border/60 bg-card'
                : 'border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-500/5'
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tăng trưởng
            </p>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl shadow-sm',
                isPositive ? 'bg-emerald-600' : isNeutral ? 'bg-slate-600' : 'bg-rose-600'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-white" />
              ) : isNeutral ? (
                <Minus className="h-4 w-4 text-white" />
              ) : (
                <TrendingDown className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
          <p
            className={cn(
              'text-4xl font-extrabold tracking-tight',
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : isNeutral
                  ? 'text-foreground'
                  : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {isNeutral ? '—' : `${isPositive ? '+' : ''}${growthValue}%`}
          </p>
          <p className="text-sm text-muted-foreground">so với {GROWTH_LABEL[timeRange]}</p>
        </div>

        {/* Nhà máy + Sản phẩm stacked */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 shadow-sm">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Số nhà máy
              </p>
              <p className="text-2xl font-bold text-foreground">{fmtNum(kpis.totalPlants)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Loại sản phẩm
              </p>
              <p className="text-2xl font-bold text-foreground">{fmtNum(kpis.totalProducts)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Highlights ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HighlightCard
          title="Nhà máy tồn kho nhiều nhất"
          id={plantMap[kpis.topPlant?.plant_id ?? ''] || kpis.topPlant?.plant_id || '—'}
          value={kpis.topPlant ? fmtNum(kpis.topPlant.total) + ' chiếc' : '—'}
          icon={Factory}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <HighlightCard
          title="Sản phẩm tồn kho nhiều nhất"
          id={productMap[kpis.topProduct?.product_id ?? ''] || kpis.topProduct?.product_id || '—'}
          value={kpis.topProduct ? fmtNum(kpis.topProduct.total) + ' chiếc' : '—'}
          icon={Package}
          color="text-primary"
          bg="bg-primary/10"
        />
      </div>

      {/* ── Charts ── */}
      {rankings?.monthlyTrend && rankings.monthlyTrend.length > 0 && (
        <SharedChartCard
          title="Xu hướng tồn kho theo tháng"
          description="Tổng lượng hàng tồn kho toàn hệ thống theo từng tháng"
          icon={<TrendingUpIcon className="size-4" />}
          height="md"
          onClick={trendZoom.open}
        >
          {trendChart}
        </SharedChartCard>
      )}

      {rankings?.topPlants && rankings.topPlants.length > 0 && (
        <SharedChartCard
          title="Phân bổ tồn kho theo nhà máy"
          description="Tồn kho tổng cộng theo từng nhà máy sản xuất"
          icon={<Factory className="size-4" />}
          height="auto"
          onClick={plantsZoom.open}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[220px]">{plantsBarChart}</div>
            <div className="space-y-2">
              {rankings.topPlants.slice(0, 5).map((p, i) => {
                const max = rankings.topPlants[0].total || 1;
                return (
                  <RankRow
                    key={p.plant_id}
                    rank={i + 1}
                    label={plantMap[p.plant_id] || p.plant_id}
                    value={`${fmtNum(p.total)} sp`}
                    pct={(p.total / max) * 100}
                    color={PLANT_COLORS[i]}
                  />
                );
              })}
            </div>
          </div>
        </SharedChartCard>
      )}

      <ChartZoomDialog
        open={trendZoom.isOpen}
        onOpenChange={trendZoom.setOpen}
        title="Xu hướng tồn kho theo tháng"
        description="Tổng lượng hàng tồn kho toàn hệ thống theo từng tháng"
        icon={<TrendingUpIcon className="size-4" />}
        size="xl"
      >
        {trendChart}
      </ChartZoomDialog>

      <ChartZoomDialog
        open={plantsZoom.isOpen}
        onOpenChange={plantsZoom.setOpen}
        title="Phân bổ tồn kho theo nhà máy"
        description="Tồn kho tổng cộng theo từng nhà máy sản xuất"
        icon={<Factory className="size-4" />}
        size="xl"
      >
        <div className="h-full w-full">{plantsBarChart}</div>
      </ChartZoomDialog>
    </div>
  );
}
