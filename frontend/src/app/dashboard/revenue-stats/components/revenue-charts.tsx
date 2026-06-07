'use client';

import { TrendingUp, Filter } from 'lucide-react';
import * as React from 'react';
import { useId } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from '@/components/charts/chart-card';
import {
  AXIS_TICK_CLASS,
  BAR_RADIUS,
  BAR_SIZE,
  CHART_DEFAULTS,
  CURSOR_STYLE,
  getChannelColor,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';
import { ChartData } from '../types';

interface RevenueChartsProps {
  charts: ChartData;
}

export function RevenueCharts({ charts }: RevenueChartsProps) {
  const reactId = useId();
  const gradId = `rc-grad-${reactId.replace(/:/g, '')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartCard
          title="Tiến độ doanh số theo tháng (Số lượng bán)"
          description="Số lượng sản phẩm phân phối trong 6 chu kỳ gần nhất"
          icon={<TrendingUp className="size-4" />}
          height="md"
          isEmpty={charts.monthly_sales.length === 0}
          emptyMessage="Không có dữ liệu xu hướng doanh số"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.monthly_sales} margin={CHART_DEFAULTS.margin}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
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
              <Tooltip
                cursor={CURSOR_STYLE}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 space-y-1">
                        <p className="font-medium">{label}</p>
                        <p className="font-mono font-medium text-foreground tabular-nums">
                          Số lượng: {payload[0].value} chiếc
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Sản lượng theo kênh phân phối"
        description="So sánh lượng hàng bán được giữa các kênh"
        icon={<Filter className="size-4" />}
        height="md"
        isEmpty={charts.distribution_channel.length === 0}
        emptyMessage="Không có dữ liệu kênh phân phối"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.distribution_channel} layout="vertical" margin={CHART_DEFAULTS.barChartMargin}>
            <CartesianGrid horizontal={false} strokeDasharray={GRID_DASH} className={GRID_CLASS} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              className={AXIS_TICK_CLASS}
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={TICK_MARGIN}
              width={90}
              className="text-[10px] text-foreground font-semibold fill-foreground"
            />
            <Tooltip
              cursor={CURSOR_STYLE}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5">
                      <p className="font-medium mb-0.5">{label}</p>
                      <p className="font-mono font-medium text-foreground tabular-nums">
                        Số lượng bán: {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={BAR_RADIUS.vertical} barSize={BAR_SIZE.lg}>
              {charts.distribution_channel.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getChannelColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
