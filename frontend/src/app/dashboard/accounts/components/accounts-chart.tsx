'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import type { IAccount } from '@/lib/types/account';

const chartConfig = {
  newAccounts: {
    label: 'Tài khoản mới',
    color: 'var(--chart-1)',
  },
  inactiveAccounts: {
    label: 'Ngừng hoạt động/Khóa',
    color: 'var(--chart-2)',
  },
  noLoginAccounts: {
    label: 'Chưa từng đăng nhập',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

interface AccountsChartProps {
  accounts: IAccount[];
}

export function AccountsChart({ accounts }: AccountsChartProps) {
  const [timeRange, setTimeRange] = React.useState('90d');

  // Generate chart data dynamically based on the accounts list
  const chartData = React.useMemo(() => {
    const referenceDate = new Date('2026-06-03');
    const days = 90; // We generate 90 days of history and filter down
    const dataList = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      // Use a 7-day rolling window to smooth the new accounts peak
      const windowStart = new Date(d);
      windowStart.setDate(windowStart.getDate() - 6);

      // 1. New accounts created in the 7-day sliding window
      const newAccounts = accounts.filter((acc) => {
        const createdTime = new Date(acc.created_at).getTime();
        return createdTime >= windowStart.getTime() && createdTime <= d.getTime();
      }).length;

      // 2. All accounts created up to day d (for cumulative stats)
      const accountsCreatedUntilD = accounts.filter((acc) => {
        const createdTime = new Date(acc.created_at).getTime();
        return createdTime <= d.getTime();
      });

      // 3. Inactive/Locked accounts up to day d
      const inactiveAccounts = accountsCreatedUntilD.filter(
        (acc) => acc.status_account === 'INACTIVE' || acc.status_account === 'LOCKED'
      ).length;

      // 4. Accounts that had not logged in yet at day d
      // (either last_login_at is null, or it happened after day d)
      const noLoginAccounts = accountsCreatedUntilD.filter(
        (acc) => !acc.last_login_at || new Date(acc.last_login_at).getTime() > d.getTime()
      ).length;

      dataList.push({
        date: dateStr,
        newAccounts,
        inactiveAccounts,
        noLoginAccounts,
      });
    }

    return dataList;
  }, [accounts]);

  // Filter based on selected time range
  const filteredData = React.useMemo(() => {
    const referenceDate = new Date('2026-06-03');
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [chartData, timeRange]);

  return (
    <Card className="pt-0 border-border bg-card shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 space-y-0 border-b border-border py-5">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-lg font-bold text-foreground">Hoạt động tài khoản</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Hiển thị xu hướng tài khoản mới, tài khoản ngưng hoạt động/khóa và chưa đăng nhập.
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[180px] rounded-lg border-border"
            aria-label="Select time range"
          >
            <SelectValue placeholder="3 tháng qua" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border">
            <SelectItem value="90d" className="rounded-lg">
              3 tháng qua
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              30 ngày qua
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 ngày qua
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-newAccounts)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-newAccounts)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillInactive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-inactiveAccounts)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-inactiveAccounts)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillNoLogin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-noLoginAccounts)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-noLoginAccounts)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('vi-VN', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              stroke="hsl(var(--muted-foreground))"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="newAccounts"
              type="natural"
              fill="url(#fillNew)"
              stroke="var(--color-newAccounts)"
              strokeWidth={2}
            />
            <Area
              dataKey="inactiveAccounts"
              type="natural"
              fill="url(#fillInactive)"
              stroke="var(--color-inactiveAccounts)"
              strokeWidth={2}
            />
            <Area
              dataKey="noLoginAccounts"
              type="natural"
              fill="url(#fillNoLogin)"
              stroke="var(--color-noLoginAccounts)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
