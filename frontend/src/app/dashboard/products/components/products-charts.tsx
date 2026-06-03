'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BarChart3, PieChart as PieChartIcon, Loader2, Database, Layers } from 'lucide-react';
import { productService } from '@/lib/services/product.service';
import { toast } from 'sonner';
import type { IProduct, IProductStats } from '@/lib/types/product';

const chartConfig = {
  count: {
    label: 'Số lượng',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

interface ProductsChartsProps {
  products: IProduct[];
}

export function ProductsCharts({ products }: ProductsChartsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<'page' | 'system'>('page');
  const [systemStats, setSystemStats] = React.useState<IProductStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(false);

  // Fetch system-wide stats when toggled
  React.useEffect(() => {
    if (viewMode === 'system' && !systemStats) {
      setIsStatsLoading(true);
      productService
        .stats()
        .then((res) => {
          setSystemStats(res.data);
        })
        .catch(() => {
          toast.error('Không thể tải phân tích trực quan toàn hệ thống.');
          setViewMode('page'); // Fallback
        })
        .finally(() => {
          setIsStatsLoading(false);
        });
    }
  }, [viewMode, systemStats]);

  // 1. Gender Distribution (Pie Chart)
  const genderData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = { MEN: 0, WOM: 0, BOY: 0, GIR: 0 };
      products.forEach((p) => {
        if (counts[p.gender] !== undefined) {
          counts[p.gender]++;
        }
      });
      return [
        { name: 'Nam (MEN)', value: counts.MEN, fill: 'hsl(217.2, 91.2%, 59.8%)' },
        { name: 'Nữ (WOM)', value: counts.WOM, fill: 'hsl(346.8, 77.2%, 49.8%)' },
        { name: 'Bé trai (BOY)', value: counts.BOY, fill: 'hsl(173.4, 80.4%, 40%)' },
        { name: 'Bé gái (GIR)', value: counts.GIR, fill: 'hsl(262.1, 83.3%, 57.8%)' },
      ].filter((d) => d.value > 0);
    } else {
      if (!systemStats) return [];
      return systemStats.gender.map((item) => {
        let name = item.name;
        let fill = 'hsl(217.2, 91.2%, 59.8%)';
        if (item.name === 'MEN') {
          name = 'Nam (MEN)';
          fill = 'hsl(217.2, 91.2%, 59.8%)';
        } else if (item.name === 'WOM') {
          name = 'Nữ (WOM)';
          fill = 'hsl(346.8, 77.2%, 49.8%)';
        } else if (item.name === 'BOY') {
          name = 'Bé trai (BOY)';
          fill = 'hsl(173.4, 80.4%, 40%)';
        } else if (item.name === 'GIR') {
          name = 'Bé gái (GIR)';
          fill = 'hsl(262.1, 83.3%, 57.8%)';
        }
        return {
          name,
          value: Number(item.count),
          fill,
        };
      });
    }
  }, [products, viewMode, systemStats]);

  // 2. Age Group Distribution
  const ageData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      products.forEach((p) => {
        counts[p.age_group] = (counts[p.age_group] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } else {
      if (!systemStats) return [];
      return systemStats.age_group
        .map((item) => ({ name: item.name, count: Number(item.count) }))
        .sort((a, b) => b.count - a.count);
    }
  }, [products, viewMode, systemStats]);

  // 3. Activity Distribution
  const activityData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      products.forEach((p) => {
        counts[p.activity_group] = (counts[p.activity_group] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } else {
      if (!systemStats) return [];
      return systemStats.activity_group
        .map((item) => ({ name: item.name, count: Number(item.count) }))
        .sort((a, b) => b.count - a.count);
    }
  }, [products, viewMode, systemStats]);

  // 4. Lifestyle Distribution
  const lifestyleData = React.useMemo(() => {
    if (viewMode === 'page') {
      const counts: Record<string, number> = {};
      products.forEach((p) => {
        counts[p.lifestyle_group] = (counts[p.lifestyle_group] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } else {
      if (!systemStats) return [];
      return systemStats.lifestyle_group
        .map((item) => ({ name: item.name, count: Number(item.count) }))
        .sort((a, b) => b.count - a.count);
    }
  }, [products, viewMode, systemStats]);

  return (
    <Card className="bg-card border-border shadow-md transition-all duration-200">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-border gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="size-5 text-blue-500" />
            Phân tích Trực quan Sản phẩm
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {viewMode === 'page'
              ? `Biểu đồ phân bố các thuộc tính của ${products.length} sản phẩm đang hiển thị.`
              : 'Biểu đồ phân bố các thuộc tính trên toàn bộ cơ sở dữ liệu hệ thống.'}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Segmented control for view mode */}
          <div className="bg-muted/50 p-1 rounded-xl flex items-center border border-border">
            <button
              onClick={() => setViewMode('page')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'page'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="size-3.5" />
              Trang hiện tại
            </button>
            <button
              onClick={() => setViewMode('system')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'system'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Database className="size-3.5" />
              Toàn hệ thống
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6 relative">
          {isStatsLoading ? (
            <div className="h-[200px] flex flex-col items-center justify-center gap-2">
              <Loader2 className="size-6 animate-spin text-blue-500" />
              <span className="text-xs text-muted-foreground">Đang tải phân tích hệ thống...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Chart 1: Giới tính */}
              <div className="space-y-2 flex flex-col items-center">
                <h4 className="text-xs font-semibold text-muted-foreground text-center flex items-center gap-1">
                  <PieChartIcon className="size-3.5 text-blue-500" />
                  Cơ cấu Giới tính
                </h4>
                {genderData.length === 0 ? (
                  <div className="h-[160px] flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu</div>
                ) : (
                  <div className="h-[160px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={55}
                          innerRadius={30}
                          paddingAngle={2}
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover border border-border px-2.5 py-1.5 rounded-lg shadow-md text-[11px] text-popover-foreground">
                                  <span className="font-semibold">{data.name}</span>: {data.value.toLocaleString('vi-VN')} sp
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend inside chart area */}
                    <div className="absolute bottom-0 flex flex-wrap justify-center gap-x-2 gap-y-1 text-[9px] w-full">
                      {genderData.map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1 font-medium">
                          <span className="size-1.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          {item.name.split(' ')[0]}: {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chart 2: Nhóm độ tuổi */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground text-center">Phân bố Độ tuổi</h4>
                {ageData.length === 0 ? (
                  <div className="h-[160px] flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu</div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          width={80}
                          tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="hsl(217.2, 91.2%, 59.8%)" radius={[0, 4, 4, 0]} barSize={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>

              {/* Chart 3: Nhóm hoạt động */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground text-center">Phân bố Hoạt động</h4>
                {activityData.length === 0 ? (
                  <div className="h-[160px] flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu</div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          width={80}
                          tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="hsl(173.4, 80.4%, 40%)" radius={[0, 4, 4, 0]} barSize={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>

              {/* Chart 4: Phong cách sống */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground text-center">Phân bố Phong cách sống</h4>
                {lifestyleData.length === 0 ? (
                  <div className="h-[160px] flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu</div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lifestyleData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          width={70}
                          tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="hsl(262.1, 83.3%, 57.8%)" radius={[0, 4, 4, 0]} barSize={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
