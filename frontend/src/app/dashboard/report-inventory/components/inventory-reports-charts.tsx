'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BarChart3, Loader2, Factory, TrendingUp } from 'lucide-react';
import { inventoryReportService } from '@/lib/services/inventory-report.service';
import { toast } from 'sonner';
import type { IInventoryReport } from '@/lib/services/inventory-report.service';

const chartConfig = {
  count: {
    label: 'Tồn kho',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface InventoryReportsChartsProps {
  reports: IInventoryReport[];
}

export function InventoryReportsCharts({ reports }: InventoryReportsChartsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'page' | 'system'>('page');
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

  // 1. Plant Inventory (Bar Chart)
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

  // 2. Monthly Inventory (Area Chart)
  const monthlyData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      reports.forEach((r) => {
        if (!r.calendar_year_week) return;
        const month = r.calendar_year_week.slice(0, 7);
        counts[month] = (counts[month] || 0) + r.quantity;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-6);
    } else {
      if (!systemStats) return [];
      return systemStats.monthly_inventory.map((item) => ({
        name: item.name,
        count: Number(item.count),
      }));
    }
  }, [reports, viewMode, systemStats]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b border-border/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-indigo-500 animate-pulse" />
          <div>
            <CardTitle className="text-base font-bold">Thống kê phân tích tồn kho</CardTitle>
            <CardDescription className="text-xs">
              Trực quan hóa lượng hàng tồn kho theo từng nhà máy sản xuất và tiến trình lưu kho hàng tháng
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
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Lượng tồn kho theo nhà máy */}
            <div className="flex flex-col border border-border/50 bg-background/20 rounded-xl p-4">
              <span className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-1.5">
                <Factory className="size-3.5 text-indigo-500" /> TỒN KHO THEO NHÀ MÁY
              </span>
              <div className="w-full h-52">
                {plantData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Không có dữ liệu
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart data={plantData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                      <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(262.1, 83.3%, 57.8%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Tồn kho theo tháng */}
            <div className="flex flex-col border border-border/50 bg-background/20 rounded-xl p-4">
              <span className="text-xs font-bold text-muted-foreground mb-4 flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-indigo-500" /> BIẾN ĐỘNG THEO THÁNG
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
                        <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                      <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px' }} />
                      <Tooltip formatter={(value) => `${new Intl.NumberFormat().format(Number(value))} chiếc`} />
                      <Area type="monotone" dataKey="count" stroke="hsl(262.1, 83.3%, 57.8%)" fillOpacity={1} fill="url(#colorInv)" />
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
