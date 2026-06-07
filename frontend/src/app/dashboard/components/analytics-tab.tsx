'use client';

import { TrendingUp, PieChartIcon, Store } from 'lucide-react';
import * as React from 'react';
import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartCard } from '@/components/charts/chart-card';
import { ChartZoomDialog, useChartZoom } from '@/components/charts/chart-zoom';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AXIS_TICK_CLASS,
  CHART_COLORS,
  CHART_DEFAULTS,
  CURSOR_STYLE,
  getChannelColor,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';
import { cn } from '@/lib/utils';

const salesChartConfig = {
  count: { label: 'Số lượng bán', color: CHART_COLORS.chart4 },
} satisfies ChartConfig;

interface AnalyticsTabProps {
  salesStats: {
    monthly_sales: { name: string; count: number }[];
    distribution_channel: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  };
  branchMap: Record<string, string>;
  colors: string[];
}

export function AnalyticsTab({ salesStats, branchMap, colors }: AnalyticsTabProps) {
  const reactId = useId();
  const gradId = `analytics-sales-grad-${reactId.replace(/:/g, '')}`;

  const trendZoom = useChartZoom();
  const channelZoom = useChartZoom();
  const branchZoom = useChartZoom();

  const channelTotal = React.useMemo(
    () => salesStats.distribution_channel.reduce((acc, curr) => acc + Math.abs(curr.count), 0),
    [salesStats.distribution_channel]
  );

  const topBranchMax = React.useMemo(
    () => Math.max(...(salesStats.top_branches?.map((b) => b.count) ?? [0]), 1),
    [salesStats.top_branches]
  );

  const salesChart = (
    <ChartContainer config={salesChartConfig} className="h-full w-full">
      <AreaChart
        data={salesStats.monthly_sales}
        margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
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
              labelFormatter={(value) => `Tháng: ${value}`}
              formatter={(value) => (
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: CHART_COLORS.chart4 }}
                  />
                  <span>Số lượng:&nbsp;</span>
                  <span className="font-mono">
                    {new Intl.NumberFormat('vi-VN').format(value as number)} sp
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={CHART_COLORS.chart4}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradId})`}
          activeDot={CHART_DEFAULTS.activeDot}
        />
      </AreaChart>
    </ChartContainer>
  );

  const channelList = (
    <div className="flex flex-col gap-4">
      {salesStats.distribution_channel.map((item, index) => {
        const percentage =
          channelTotal > 0 ? ((Math.abs(item.count) / channelTotal) * 100).toFixed(1) : '0';
        const color = colors[index % colors.length] ?? getChannelColor(item.name);

        return (
          <div key={item.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-foreground truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-right font-medium shrink-0">
                <span className="text-foreground">
                  {item.count > 0
                    ? `${new Intl.NumberFormat('vi-VN').format(item.count)} sp`
                    : `Hoàn ${new Intl.NumberFormat('vi-VN').format(Math.abs(item.count))} sp`}
                </span>
                <span className="text-muted-foreground font-normal">({percentage}%)</span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ backgroundColor: color, width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const branchList = (
    <div className="flex flex-col gap-4">
      {salesStats.top_branches?.slice(0, 5).map((branch, index) => {
        const percentage = ((branch.count / topBranchMax) * 100).toFixed(0);
        return (
          <div key={branch.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
                    'bg-chart-4/10 text-chart-4'
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className="text-foreground truncate max-w-[180px]"
                  title={branchMap[branch.name] || branch.name}
                >
                  {branchMap[branch.name] || branch.name}
                </span>
              </div>
              <span className="text-chart-4 font-bold shrink-0 font-mono">
                {new Intl.NumberFormat('vi-VN').format(branch.count)} sp
              </span>
            </div>
            <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-chart-4 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
        <ChartCard
          className="lg:col-span-2"
          title="Biến động doanh số bán ra (Sales Trend)"
          description="Tổng lượng sản phẩm được bán thành công theo từng tháng"
          icon={<TrendingUp className="size-4" />}
          height="lg"
          isEmpty={salesStats.monthly_sales.length === 0}
          emptyMessage="Không có dữ liệu biểu đồ."
          onClick={trendZoom.open}
        >
          {salesChart}
        </ChartCard>

        <div className="flex flex-col gap-6">
          <ChartCard
            title="Cơ cấu kênh phân phối"
            description="Tỷ trọng số lượng sản phẩm tiêu thụ theo kênh"
            icon={<PieChartIcon className="size-4" />}
            height="auto"
            isEmpty={salesStats.distribution_channel.length === 0}
            emptyMessage="Không có dữ liệu kênh phân phối"
            onClick={channelZoom.open}
          >
            <div className="flex flex-col gap-3.5">
              {salesStats.distribution_channel.map((item, index) => {
                const percentage =
                  channelTotal > 0 ? ((Math.abs(item.count) / channelTotal) * 100).toFixed(1) : '0';
                const color = colors[index % colors.length] ?? getChannelColor(item.name);

                return (
                  <div key={item.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-foreground truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-right font-medium shrink-0">
                        <span className="text-foreground">
                          {item.count > 0
                            ? `${new Intl.NumberFormat('vi-VN').format(item.count)} sp`
                            : `Hoàn ${new Intl.NumberFormat('vi-VN').format(Math.abs(item.count))} sp`}
                        </span>
                        <span className="text-muted-foreground font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ backgroundColor: color, width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard
            title="Chi nhánh bán chạy nhất"
            description="Xếp hạng doanh số bán hàng theo chi nhánh cửa hàng"
            icon={<Store className="size-4" />}
            height="auto"
            isEmpty={!salesStats.top_branches || salesStats.top_branches.length === 0}
            emptyMessage="Không có dữ liệu chi nhánh."
            onClick={branchZoom.open}
          >
            <div className="flex flex-col gap-3.5">
              {salesStats.top_branches?.slice(0, 5).map((branch, index) => {
                const percentage = ((branch.count / topBranchMax) * 100).toFixed(0);
                return (
                  <div key={branch.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            'flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold shrink-0',
                            'bg-chart-4/10 text-chart-4'
                          )}
                        >
                          {index + 1}
                        </span>
                        <span
                          className="text-foreground truncate max-w-[120px]"
                          title={branchMap[branch.name] || branch.name}
                        >
                          {branchMap[branch.name] || branch.name}
                        </span>
                      </div>
                      <span className="text-chart-4 font-bold shrink-0 font-mono">
                        {new Intl.NumberFormat('vi-VN').format(branch.count)} sp
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-chart-4 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      </div>

      <ChartZoomDialog
        open={trendZoom.isOpen}
        onOpenChange={trendZoom.setOpen}
        title="Biến động doanh số bán ra"
        description="Tổng lượng sản phẩm được bán thành công theo từng tháng"
        icon={<TrendingUp className="size-4" />}
        size="xl"
      >
        {salesChart}
      </ChartZoomDialog>

      <ChartZoomDialog
        open={channelZoom.isOpen}
        onOpenChange={channelZoom.setOpen}
        title="Cơ cấu kênh phân phối"
        description="Tỷ trọng số lượng sản phẩm tiêu thụ theo kênh"
        icon={<PieChartIcon className="size-4" />}
        size="md"
      >
        {channelList}
      </ChartZoomDialog>

      <ChartZoomDialog
        open={branchZoom.isOpen}
        onOpenChange={branchZoom.setOpen}
        title="Chi nhánh bán chạy nhất"
        description="Xếp hạng doanh số bán hàng theo chi nhánh cửa hàng"
        icon={<Store className="size-4" />}
        size="md"
      >
        {branchList}
      </ChartZoomDialog>
    </>
  );
}
