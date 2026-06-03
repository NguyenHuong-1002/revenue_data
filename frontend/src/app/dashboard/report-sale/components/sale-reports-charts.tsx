'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BarChart3, PieChart as PieChartIcon, Loader2, Database, TrendingUp } from 'lucide-react';
import { saleReportService } from '@/lib/services/sale-report.service';
import { toast } from 'sonner';
import type { ISaleReport } from '@/lib/services/sale-report.service';

const chartConfig = {
  count: {
    label: 'Số lượng bán',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface SaleReportsChartsProps {
  reports: ISaleReport[];
}

export function SaleReportsCharts({ reports }: SaleReportsChartsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'page' | 'system'>('page');
  const [systemStats, setSystemStats] = React.useState<{
    distribution_channel: { name: string; count: number }[];
    monthly_sales: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(false);

  React.useEffect(() => {
    if (viewMode === 'system' && !systemStats) {
      setIsStatsLoading(true);
      saleReportService
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

  // 1. Channel Distribution (Pie Chart)
  const channelData = React.useMemo(() => {
    const channelColors: Record<string, string> = {
      'Online': 'hsl(217.2, 91.2%, 59.8%)',
      'Bán lẻ': 'hsl(346.8, 77.2%, 49.8%)',
      'Phát sinh': 'hsl(173.4, 80.4%, 40%)',
      'Bán sỉ': 'hsl(262.1, 83.3%, 57.8%)',
      'Siêu thị': 'hsl(47.9, 95.8%, 53.1%)',
      'Hợp đồng': 'hsl(25, 95%, 53%)',
      'Chi nhánh': 'hsl(142.1, 76.2%, 36.3%)',
    };

    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      reports.forEach((r) => {
        counts[r.distribution_channel] = (counts[r.distribution_channel] || 0) + r.sold_quantity;
      });
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        fill: channelColors[name] || 'hsl(215, 20%, 50%)',
      })).sort((a, b) => b.value - a.value);
    } else {
      if (!systemStats) return [];
      return systemStats.distribution_channel.map((item) => ({
        name: item.name,
        value: Number(item.count),
        fill: channelColors[item.name] || 'hsl(215, 20%, 50%)',
      }));
    }
  }, [reports, viewMode, systemStats]);

  // 2. Top Branches
  const branchData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      reports.forEach((r) => {
        counts[r.branch_id] = (counts[r.branch_id] || 0) + r.sold_quantity;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } else {
      if (!systemStats) return [];
      return systemStats.top_branches.map((item) => ({
        name: item.name,
        count: Number(item.count),
      }));
    }
  }, [reports, viewMode, systemStats]);

  // 3. Monthly Sales (Area Chart)
  const monthlyData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      reports.forEach((r) => {
        const month = r.time_report.slice(0, 7);
        counts[month] = (counts[month] || 0) + r.sold_quantity;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-6);
    } else {
      if (!systemStats) return [];
      return systemStats.monthly_sales.map((item) => ({
        name: item.name,
        count: Number(item.count),
      }));
    }
  }, [reports, viewMode, systemStats]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-border/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-blue-500 animate-pulse" />
          <div>
            <CardTitle className="text-base font-bold">Thống kê phân tích báo cáo doanh số</CardTitle>
            <CardDescription className="text-xs">
              Trực quan hóa kênh phân phối, chi nhánh hàng đầu và tiến độ bán hàng
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden bg-background p-0.5">
            <Button
              variant={viewMode === 'page' ? 'secondary' : 'ghost'}
              size="xs"
              className="text-[10px] h-7 px-2 font-medium"
              onClick={() => setViewMode('page')}
            >
              Trang này
            </Button>
            <Button
              variant={viewMode === 'system' ? 'secondary' : 'ghost'}
              size="xs"
              className="text-[10px] h-7 px-2 font-medium"
              onClick={() => setViewMode('system')}
            >
              Toàn hệ thống
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-6 relative">
          {isStatsLoading && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-xs">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart 1: Kênh phân phối */}
            <div className="flex flex-col items-center border border-border/50 bg-background/20 rounded-xl p-4">
              <span className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-1.5 self-start">
                <PieChartIcon className="size-3.5 text-blue-500" /> KÊNH PHÂN PHỐI
              </span>
              <div className="w-full h-52">
                {channelData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Không có dữ liệu
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        style={{ fontSize: '9px', fontWeight: 'bold' }}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${new Intl.NumberFormat().format(Number(value))} chiếc`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Top chi nhánh */}
            <div className="flex flex-col border border-border/50 bg-background/20 rounded-xl p-4">
              <span className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-1.5">
                <Database className="size-3.5 text-blue-500" /> CHI NHÁNH BÁN CHẠY
              </span>
              <div className="w-full h-52">
                {branchData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Không có dữ liệu
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                        <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(217.2, 91.2%, 59.8%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>
            </div>

            {/* Chart 3: Doanh số theo tháng */}
            <div className="flex flex-col border border-border/50 bg-background/20 rounded-xl p-4">
              <span className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-blue-500" /> TIẾN TRÌNH THEO THÁNG
              </span>
              <div className="w-full h-52">
                {monthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Không có dữ liệu
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217.2, 91.2%, 59.8%)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(217.2, 91.2%, 59.8%)" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                      <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                      <Tooltip formatter={(value) => `${new Intl.NumberFormat().format(Number(value))} chiếc`} />
                      <Area type="monotone" dataKey="count" stroke="hsl(217.2, 91.2%, 59.8%)" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
