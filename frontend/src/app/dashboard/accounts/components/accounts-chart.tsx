'use client';

// ===== Biểu đồ hoạt động tài khoản (AreaChart) =====
// Hiển thị 3 đường: Tài khoản mới, Ngừng hoạt động/Khóa, Chưa đăng nhập
// Có bộ lọc thời gian: 7 ngày / 30 ngày / 3 tháng

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

// Cấu hình màu sắc và nhãn cho từng đường trên biểu đồ
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
  timeRange: string;
  setTimeRange: (value: string) => void;
}

export function AccountsChart({ accounts, timeRange, setTimeRange }: AccountsChartProps) {
  // Tạo dữ liệu biểu đồ động từ danh sách tài khoản
  const chartData = React.useMemo(() => {
    const referenceDate = new Date('2026-06-03');
    const days = 365; // Tạo 365 ngày lịch sử để hỗ trợ lọc 1 năm (1year)
    const dataList = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      // Cửa sổ trượt 7 ngày để làm mượt số liệu
      const windowStart = new Date(d);
      windowStart.setDate(windowStart.getDate() - 6);

      // 1. Tài khoản mới trong 7 ngày gần đây
      const newAccounts = accounts.filter((acc) => {
        const createdTime = new Date(acc.created_at).getTime();
        return createdTime >= windowStart.getTime() && createdTime <= d.getTime();
      }).length;

      // 2. Tổng số tài khoản được tạo đến ngày d
      const accountsCreatedUntilD = accounts.filter((acc) => {
        const createdTime = new Date(acc.created_at).getTime();
        return createdTime <= d.getTime();
      });

      // 3. Số tài khoản bị khóa/ngưng hoạt động đến ngày d
      const inactiveAccounts = accountsCreatedUntilD.filter(
        (acc) => acc.status_account === 'INACTIVE' || acc.status_account === 'LOCKED'
      ).length;

      // 4. Số tài khoản chưa từng đăng nhập đến ngày d
      const noLoginAccounts = accountsCreatedUntilD.filter(
        (acc) => !acc.last_login_at || new Date(acc.last_login_at).getTime() > d.getTime()
      ).length;

      dataList.push({ date: dateStr, newAccounts, inactiveAccounts, noLoginAccounts });
    }

    return dataList;
  }, [accounts]);

  // Lọc dữ liệu theo khoảng thời gian đã chọn
  const filteredData = React.useMemo(() => {
    const referenceDate = new Date('2026-06-03'); // Đồng bộ ngày mốc với chartData để lọc chính xác
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
        daysToSubtract = 180; // 6 tháng tương đương 180 ngày
        break;
      case '1year':
      case '1y':
      case '365d':
      default:
        daysToSubtract = 365; // Lọc 1 năm
        break;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => new Date(item.date) >= startDate);
  }, [chartData, timeRange]);

  return (
    <Card className="pt-0 border-border bg-card shadow-md">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 space-y-0 border-b border-border py-5">
        {/* Tiêu đề + mô tả */}
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-lg font-bold text-foreground">Hoạt động tài khoản</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Hiển thị xu hướng tài khoản mới, tài khoản ngưng hoạt động/khóa và chưa đăng nhập.
          </CardDescription>
        </div>
        {/* Bộ lọc thời gian */}
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-45 rounded-lg border-border" aria-label="Select time range">
            <SelectValue placeholder="1 tháng" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border">
            <SelectItem value="1year" className="rounded-lg">
              1 năm
            </SelectItem>
            <SelectItem value="6m" className="rounded-lg">
              6 tháng
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              3 tháng qua
            </SelectItem>
            <SelectItem value="1month" className="rounded-lg">
              1 tháng
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
            {/* Gradient fill cho từng đường */}
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

            {/* Grid nền */}
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />

            {/* Trục X (ngày tháng) */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
              }}
              stroke="hsl(var(--muted-foreground))"
            />

            {/* Tooltip khi hover */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  }
                  indicator="dot"
                />
              }
            />

            {/* 3 đường Area */}
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

            {/* Chú thích */}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
