'use client';

import { ChevronDown, ChevronUp, BarChart3, Factory, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { useId } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';
import { ChartCard } from '@/components/charts/chart-card';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { ChartZoomDialog, useChartZoom } from '@/components/charts/chart-zoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AXIS_TICK_CLASS,
  BAR_RADIUS,
  CHART_COLORS,
  CURSOR_STYLE,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';
import { inventoryReportService } from '@/lib/services/inventory-report.service';
import type { IInventoryReport } from '@/lib/services/inventory-report.service';
import { InventoryReportsChartsSkeleton } from './inventory-reports-skeleton';

const plantChartConfig = {
  count: { label: 'Tồn kho', color: CHART_COLORS.chart4 },
} satisfies ChartConfig;

const monthlyChartConfig = {
  count: { label: 'Lượng tồn kho', color: CHART_COLORS.chart4 },
} satisfies ChartConfig;

interface InventoryReportsChartsProps {
  reports: IInventoryReport[];
}

export function InventoryReportsCharts({ reports }: InventoryReportsChartsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'page' | 'system'>('system');
  const [systemStats, setSystemStats] = React.useState<{
    plant_inventory: { name: string; count: number }[];
    monthly_inventory: { name: string; count: number }[];
  } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(false);

  React.useEffect(() => {
    if (viewMode === 'system' && !systemStats) {
      setIsStatsLoading(true);
      inventoryReportService
        .getStats()
        .then((res) => {
          setSystemStats(res.data);
        })
        .catch(() => {
          toast.error('Không thể tải phân tích toàn hệ thống.');
          setViewMode('page');
        })
        .finally(() => {
          setIsStatsLoading(false);
        });
    }
  }, [viewMode, systemStats]);

  const plantData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      reports.forEach((r) => {
        counts[r.plant_id] = (counts[r.plant_id] || 0) + r.quantity;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } else {
      if (!systemStats) return [];
      return systemStats.plant_inventory.map((item) => ({
        name: item.name,
        count: Number(item.count),
      }));
    }
  }, [reports, viewMode, systemStats]);

  const monthlyData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      reports.forEach((r) => {
        if (!r.calendar_year_week) return;
        const dateKey = r.calendar_year_week.slice(0, 10);
        counts[dateKey] = (counts[dateKey] || 0) + r.quantity;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      if (!systemStats) return [];
      return systemStats.monthly_inventory.map((item) => ({
        name: item.name,
        count: Number(item.count),
      }));
    }
  }, [reports, viewMode, systemStats]);

  const reactId = useId();
  const monthlyGradId = `inv-monthly-grad-${reactId.replace(/:/g, '')}`;

  const plantZoom = useChartZoom();
  const monthlyZoom = useChartZoom();

  const plantChart = (
    <ChartContainer config={plantChartConfig} className="h-full w-full">
      <BarChart data={plantData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
        <CartesianGrid vertical={false} strokeDasharray={GRID_DASH} className={GRID_CLASS} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={TICK_MARGIN}
          className={AXIS_TICK_CLASS}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={TICK_MARGIN}
          className={AXIS_TICK_CLASS}
        />
        <ChartTooltip cursor={CURSOR_STYLE} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" fill={CHART_COLORS.chart4} radius={BAR_RADIUS.vertical} />
      </BarChart>
    </ChartContainer>
  );

  const monthlyChart = (
    <ChartContainer config={monthlyChartConfig} className="h-full w-full">
      <AreaChart data={monthlyData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={monthlyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.chart4} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.chart4} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray={GRID_DASH} className={GRID_CLASS} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={TICK_MARGIN}
          className={AXIS_TICK_CLASS}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={TICK_MARGIN}
          className={AXIS_TICK_CLASS}
        />
        <ChartTooltip
          cursor={CURSOR_STYLE}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-mono">
                  {new Intl.NumberFormat().format(value as number)} chiếc
                </span>
              )}
              hideLabel
            />
          }
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={CHART_COLORS.chart4}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${monthlyGradId})`}
        />
      </AreaChart>
    </ChartContainer>
  );

  return (
    <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="flex flex-row items-center justify-between gap-3 border-b border-border/60 py-3.5 px-5 bg-muted/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BarChart3 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">Thống kê phân tích tồn kho</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Trực quan hóa lượng hàng tồn kho theo từng nhà máy sản xuất và tiến trình lưu kho hàng
              tháng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] h-7 px-2.5 font-semibold flex items-center justify-center rounded-lg shadow-sm uppercase tracking-wider">
            Toàn hệ thống
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <CardContent className="p-5 relative">
          {isStatsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartSkeleton height="sm" />
              <ChartSkeleton height="sm" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard
                title="Tồn kho theo nhà máy"
                icon={<Factory className="size-4" />}
                height="sm"
                isEmpty={plantData.length === 0}
                emptyMessage="Không có dữ liệu"
                onClick={plantZoom.open}
              >
                {plantChart}
              </ChartCard>

              <ChartCard
                title="Biến động toàn thời gian"
                icon={<TrendingUp className="size-4" />}
                height="sm"
                isEmpty={monthlyData.length === 0}
                emptyMessage="Không có dữ liệu"
                onClick={monthlyZoom.open}
              >
                {monthlyChart}
              </ChartCard>
            </div>
          )}
        </CardContent>
      )}

      <ChartZoomDialog
        open={plantZoom.isOpen}
        onOpenChange={plantZoom.setOpen}
        title="Tồn kho theo nhà máy"
        description="Lượng hàng tồn kho phân bổ theo từng nhà máy sản xuất"
        icon={<Factory className="size-4" />}
        size="lg"
      >
        {plantChart}
      </ChartZoomDialog>

      <ChartZoomDialog
        open={monthlyZoom.isOpen}
        onOpenChange={monthlyZoom.setOpen}
        title="Biến động toàn thời gian"
        description="Lượng hàng tồn kho theo tiến trình thời gian"
        icon={<TrendingUp className="size-4" />}
        size="lg"
      >
        {monthlyChart}
      </ChartZoomDialog>
    </Card>
  );
}
