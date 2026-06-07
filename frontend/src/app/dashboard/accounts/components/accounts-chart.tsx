'use client';

import * as React from 'react';
import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ChartZoomButton, ChartZoomDialog, useChartZoom } from '@/components/charts/chart-zoom';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AXIS_TICK_CLASS,
  CURSOR_STYLE,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';
import type { IAccount } from '@/lib/types/account';
import { cn } from '@/lib/utils';

const chartConfig = {
  newAccounts: { label: 'Tài khoản mới', color: 'var(--primary)' },
  inactiveAccounts: { label: 'Ngừng hoạt động/Khóa', color: 'var(--destructive)' },
  noLoginAccounts: { label: 'Chưa từng đăng nhập', color: 'var(--chart-3)' },
} satisfies ChartConfig;

interface AccountsChartProps {
  accounts: IAccount[];
  timeRange: string;
  setTimeRange: (value: string) => void;
  isLoading?: boolean;
}

export function AccountsChart({
  accounts,
  timeRange,
  setTimeRange,
  isLoading = false,
}: AccountsChartProps) {
  const [activeSeries, setActiveSeries] = React.useState({
    newAccounts: true,
    inactiveAccounts: true,
    noLoginAccounts: true,
  });

  const today = React.useMemo(() => new Date(), []);

  const chartData = React.useMemo(() => {
    const dataList = [];
    const days = 365;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const windowStart = new Date(d);
      windowStart.setDate(windowStart.getDate() - 6);

      const newAccounts = accounts.filter((acc) => {
        const createdTime = new Date(acc.created_at).getTime();
        return createdTime >= windowStart.getTime() && createdTime <= d.getTime();
      }).length;

      const accountsCreatedUntilD = accounts.filter((acc) => {
        const createdTime = new Date(acc.created_at).getTime();
        return createdTime <= d.getTime();
      });

      const inactiveAccounts = accountsCreatedUntilD.filter(
        (acc) => acc.status_account === 'INACTIVE' || acc.status_account === 'LOCKED'
      ).length;

      const noLoginAccounts = accountsCreatedUntilD.filter(
        (acc) => !acc.last_login_at || new Date(acc.last_login_at).getTime() > d.getTime()
      ).length;

      dataList.push({ date: dateStr, newAccounts, inactiveAccounts, noLoginAccounts });
    }
    return dataList;
  }, [accounts, today]);

  const filteredData = React.useMemo(() => {
    let daysToSubtract;
    switch (timeRange) {
      case '7d':
        daysToSubtract = 7;
        break;
      case '1month':
      case '30d':
        daysToSubtract = 30;
        break;
      case '90d':
        daysToSubtract = 90;
        break;
      case '6m':
        daysToSubtract = 180;
        break;
      default:
        daysToSubtract = 365;
        break;
    }
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return chartData.filter((item) => new Date(item.date) >= startDate);
  }, [chartData, timeRange, today]);

  const totals = React.useMemo(() => {
    if (filteredData.length === 0) {
      return { newAccounts: 0, inactiveAccounts: 0, noLoginAccounts: 0 };
    }
    const lastItem = filteredData[filteredData.length - 1];
    let daysToSubtract = 30;
    switch (timeRange) {
      case '7d':
        daysToSubtract = 7;
        break;
      case '1month':
      case '30d':
        daysToSubtract = 30;
        break;
      case '90d':
        daysToSubtract = 90;
        break;
      case '6m':
        daysToSubtract = 180;
        break;
      default:
        daysToSubtract = 365;
        break;
    }
    const startFilterDate = new Date(today);
    startFilterDate.setDate(startFilterDate.getDate() - daysToSubtract);

    const newCreatedCount = accounts.filter((acc) => {
      const createdTime = new Date(acc.created_at).getTime();
      return createdTime >= startFilterDate.getTime() && createdTime <= today.getTime();
    }).length;

    return {
      newAccounts: newCreatedCount,
      inactiveAccounts: lastItem.inactiveAccounts,
      noLoginAccounts: lastItem.noLoginAccounts,
    };
  }, [filteredData, accounts, timeRange, today]);

  const reactId = useId();
  const gradIds = {
    new: `acc-grad-new-${reactId.replace(/:/g, '')}`,
    inactive: `acc-grad-inactive-${reactId.replace(/:/g, '')}`,
    noLogin: `acc-grad-nologin-${reactId.replace(/:/g, '')}`,
  };
  const zoom = useChartZoom();

  const chartContent = (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart data={filteredData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
        <defs>
          <linearGradient id={gradIds.new} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={gradIds.inactive} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={gradIds.noLogin} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} strokeDasharray={GRID_DASH} className={GRID_CLASS} />

        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={TICK_MARGIN}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
          }}
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
              labelFormatter={(value) =>
                new Date(value as string).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }
              indicator="dot"
            />
          }
        />

        {activeSeries.newAccounts && (
          <Area
            dataKey="newAccounts"
            type="monotone"
            fill={`url(#${gradIds.new})`}
            stroke="var(--primary)"
            strokeWidth={2}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        )}
        {activeSeries.inactiveAccounts && (
          <Area
            dataKey="inactiveAccounts"
            type="monotone"
            fill={`url(#${gradIds.inactive})`}
            stroke="var(--destructive)"
            strokeWidth={2}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        )}
        {activeSeries.noLoginAccounts && (
          <Area
            dataKey="noLoginAccounts"
            type="monotone"
            fill={`url(#${gradIds.noLogin})`}
            stroke="var(--chart-3)"
            strokeWidth={2}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );

  if (isLoading) {
    return (
      <Card className="pt-0 border border-border/60 bg-card shadow-sm overflow-hidden animate-in fade-in duration-300">
        <ChartSkeleton height="lg" showLegend />
      </Card>
    );
  }

  return (
    <Card className="pt-0 border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 space-y-0 border-b border-border/60 py-3.5 px-5 bg-muted/10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">Biểu đồ xu hướng hoạt động</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Lọc, theo dõi và click vào các thẻ số liệu dưới đây để bật/tắt hiển thị biểu đồ.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-40 rounded-lg border-border h-9 text-xs font-semibold bg-background"
              aria-label="Select time range"
            >
              <SelectValue placeholder="1 tháng" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="1year" className="rounded-lg text-xs">
                1 năm gần đây
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg text-xs">
                6 tháng qua
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg text-xs">
                3 tháng qua
              </SelectItem>
              <SelectItem value="1month" className="rounded-lg text-xs">
                1 tháng gần nhất
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg text-xs">
                7 ngày qua
              </SelectItem>
            </SelectContent>
          </Select>
          <ChartZoomButton onClick={zoom.open} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/60 bg-muted/5">
        <button
          onClick={() => setActiveSeries((prev) => ({ ...prev, newAccounts: !prev.newAccounts }))}
          className={cn(
            'flex flex-col justify-center gap-1.5 px-6 py-4 text-left border-r border-border/60 hover:bg-muted/10 transition-all focus:outline-none cursor-pointer relative',
            !activeSeries.newAccounts && 'opacity-40 bg-muted/5'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Tài khoản mới
            </span>
          </div>
          <span className="text-2xl font-extrabold text-foreground font-mono">
            +{totals.newAccounts}
          </span>
          {activeSeries.newAccounts && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
          )}
        </button>

        <button
          onClick={() =>
            setActiveSeries((prev) => ({ ...prev, inactiveAccounts: !prev.inactiveAccounts }))
          }
          className={cn(
            'flex flex-col justify-center gap-1.5 px-6 py-4 text-left border-r border-border/60 hover:bg-muted/10 transition-all focus:outline-none cursor-pointer relative',
            !activeSeries.inactiveAccounts && 'opacity-40 bg-muted/5'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Bị khóa / Tạm ngưng
            </span>
          </div>
          <span className="text-2xl font-extrabold text-foreground font-mono">
            {totals.inactiveAccounts}
          </span>
          {activeSeries.inactiveAccounts && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive" />
          )}
        </button>

        <button
          onClick={() =>
            setActiveSeries((prev) => ({ ...prev, noLoginAccounts: !prev.noLoginAccounts }))
          }
          className={cn(
            'flex flex-col justify-center gap-1.5 px-6 py-4 text-left hover:bg-muted/10 transition-all focus:outline-none cursor-pointer relative',
            !activeSeries.noLoginAccounts && 'opacity-40 bg-muted/5'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-chart-3" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Chưa đăng nhập
            </span>
          </div>
          <span className="text-2xl font-extrabold text-foreground font-mono">
            {totals.noLoginAccounts}
          </span>
          {activeSeries.noLoginAccounts && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-chart-3" />
          )}
        </button>
      </div>

      <CardContent className="px-2 pt-6 sm:px-6">
        <div className="aspect-auto h-[300px] w-full">{chartContent}</div>
      </CardContent>

      <ChartZoomDialog
        open={zoom.isOpen}
        onOpenChange={zoom.setOpen}
        title="Biểu đồ xu hướng hoạt động"
        description="Lọc, theo dõi và click vào các thẻ số liệu dưới đây để bật/tắt hiển thị biểu đồ."
        icon={<TrendingUp className="size-4" />}
        size="xl"
      >
        {chartContent}
      </ChartZoomDialog>
    </Card>
  );
}
