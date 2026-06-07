'use client';

import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2,
  Database,
  TrendingUp,
} from 'lucide-react';
import * as React from 'react';
import { useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { toast } from 'sonner';
import { ChartCard } from '@/components/charts/chart-card';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AXIS_TICK_CLASS,
  BAR_RADIUS,
  CHANNEL_COLORS,
  CHART_COLORS,
  CHART_DEFAULTS,
  CURSOR_STYLE,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';
import { saleReportService } from '@/lib/services/sale-report.service';
import type { ISaleReport } from '@/lib/services/sale-report.service';

const branchChartConfig = {
  count: { label: 'Số lượng bán', color: CHART_COLORS.chart1 },
} satisfies ChartConfig;

const monthlyChartConfig = {
  count: { label: 'Doanh số', color: CHART_COLORS.chart1 },
} satisfies ChartConfig;

interface SaleReportsChartsProps {
  reports: ISaleReport[];
}

export function SaleReportsCharts({ reports }: SaleReportsChartsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [zoomedChart, setZoomedChart] = React.useState<'channel' | 'branch' | 'monthly' | null>(
    null
  );
  const [systemStats, setSystemStats] = React.useState<{
    distribution_channel: { name: string; count: number }[];
    monthly_sales: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsStatsLoading(true);
    saleReportService
      .getStats()
      .then((res) => {
        setSystemStats(res.data);
      })
      .catch(() => {
        toast.error('Không thể tải phân tích toàn hệ thống.');
      })
      .finally(() => {
        setIsStatsLoading(false);
      });
  }, [reports]);

  const channelData = React.useMemo(() => {
    if (!systemStats) return [];
    return systemStats.distribution_channel.map((item) => ({
      name: item.name,
      value: Number(item.count),
      fill: CHANNEL_COLORS[item.name] || 'var(--muted-foreground)',
    }));
  }, [systemStats]);

  const branchData = React.useMemo(() => {
    if (!systemStats) return [];
    return systemStats.top_branches.map((item) => ({
      name: item.name,
      count: Number(item.count),
    }));
  }, [systemStats]);

  const monthlyData = React.useMemo(() => {
    if (!systemStats) return [];
    return systemStats.monthly_sales.map((item) => ({
      name: item.name,
      count: Number(item.count),
    }));
  }, [systemStats]);

  const reactId = useId();
  const monthlyGradId = `sale-monthly-grad-${reactId.replace(/:/g, '')}`;
  const monthlyZoomGradId = `sale-monthly-zoom-grad-${reactId.replace(/:/g, '')}`;

  const channelTotal = React.useMemo(
    () => channelData.reduce((acc, curr) => acc + curr.value, 0),
    [channelData]
  );
  const branchTotal = React.useMemo(
    () => branchData.reduce((acc, curr) => acc + curr.count, 0),
    [branchData]
  );

  const pieFormatter = (value: number | string) =>
    `${new Intl.NumberFormat().format(Number(value))} chiếc`;

  return (
    <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="flex flex-row items-center justify-between gap-3 border-b border-border/60 py-3.5 px-5 bg-muted/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BarChart3 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              Thống kê phân tích báo cáo doanh số
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              Trực quan hóa kênh phân phối, chi nhánh hàng đầu và tiến độ bán hàng
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
          {isStatsLoading && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-xs">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {isStatsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ChartSkeleton height="sm" />
              <ChartSkeleton height="sm" />
              <ChartSkeleton height="sm" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ChartCard
                title="Kênh phân phối"
                icon={<PieChartIcon className="size-4" />}
                height="sm"
                isEmpty={channelData.length === 0}
                emptyMessage="Không có dữ liệu"
                onClick={() => setZoomedChart('channel')}
              >
                <ChartContainer config={branchChartConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={channelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={CHART_DEFAULTS.pieOuterRadius}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      style={{ fontSize: '9px', fontWeight: 'bold' }}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span className="font-mono">{pieFormatter(value as number)}</span>
                          )}
                          hideLabel
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </ChartCard>

              <ChartCard
                title="Chi nhánh bán chạy"
                icon={<Database className="size-4" />}
                height="sm"
                isEmpty={branchData.length === 0}
                emptyMessage="Không có dữ liệu"
                onClick={() => setZoomedChart('branch')}
              >
                <ChartContainer config={branchChartConfig} className="h-full w-full">
                  <BarChart data={branchData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray={GRID_DASH}
                      className={GRID_CLASS}
                    />
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
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="count" fill={CHART_COLORS.chart1} radius={BAR_RADIUS.vertical} />
                  </BarChart>
                </ChartContainer>
              </ChartCard>

              <ChartCard
                title="Tiến trình theo tháng"
                icon={<TrendingUp className="size-4" />}
                height="sm"
                isEmpty={monthlyData.length === 0}
                emptyMessage="Không có dữ liệu"
                onClick={() => setZoomedChart('monthly')}
              >
                <ChartContainer config={monthlyChartConfig} className="h-full w-full">
                  <AreaChart
                    data={monthlyData}
                    margin={{ left: -10, right: 10, top: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id={monthlyGradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.chart1} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.chart1} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray={GRID_DASH}
                      className={GRID_CLASS}
                    />
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
                            <span className="font-mono">{pieFormatter(value as number)}</span>
                          )}
                          hideLabel
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLORS.chart1}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#${monthlyGradId})`}
                    />
                  </AreaChart>
                </ChartContainer>
              </ChartCard>
            </div>
          )}
        </CardContent>
      )}

      <Dialog
        open={zoomedChart === 'channel'}
        onOpenChange={(open) => !open && setZoomedChart(null)}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích kênh phân phối
            </DialogTitle>
            <DialogDescription className="text-xs">
              Biểu đồ trực quan và số liệu chi tiết về tỷ lệ bán hàng của từng kênh phân phối trên
              hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {channelData.length > 0 ? (
                <ChartContainer config={branchChartConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={CHART_DEFAULTS.pieInnerRadiusLarge}
                      outerRadius={CHART_DEFAULTS.pieOuterRadiusLarge}
                      paddingAngle={CHART_DEFAULTS.piePaddingAngleLarge}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span className="font-mono">{pieFormatter(value as number)}</span>
                          )}
                          hideLabel
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Không có dữ liệu kênh phân phối
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 max-h-[320px] overflow-y-auto">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5">
                  {channelData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        {item.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">
                          {new Intl.NumberFormat().format(item.value)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5">
                          ({channelTotal > 0 ? ((item.value / channelTotal) * 100).toFixed(1) : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Kênh phân phối</p>
                <div className="leading-relaxed opacity-90 list-none">
                  Kênh phân phối cho biết nguồn phát sinh đơn hàng. Việc tối ưu hóa các kênh giúp
                  cải thiện biên lợi nhuận và định hướng chiến lược marketing.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={zoomedChart === 'branch'}
        onOpenChange={(open) => !open && setZoomedChart(null)}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích chi nhánh bán chạy
            </DialogTitle>
            <DialogDescription className="text-xs">
              Biểu đồ trực quan và số liệu chi tiết về doanh số bán hàng của các chi nhánh hàng đầu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {branchData.length > 0 ? (
                <ChartContainer config={branchChartConfig} className="h-full w-full">
                  <BarChart data={branchData} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray={GRID_DASH}
                      className={GRID_CLASS}
                    />
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
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.chart1}
                      radius={BAR_RADIUS.verticalLarge}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Không có dữ liệu chi nhánh
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 max-h-[320px] overflow-y-auto">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Doanh số chi nhánh
                </span>
                <div className="space-y-2.5">
                  {branchData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 font-medium">{item.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">
                          {new Intl.NumberFormat().format(item.count)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5">
                          ({branchTotal > 0 ? ((item.count / branchTotal) * 100).toFixed(1) : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Hiệu suất chi nhánh</p>
                <div className="leading-relaxed opacity-90">
                  Biểu đồ hiển thị top 5 chi nhánh có doanh số tốt nhất. Giúp ban quản trị dễ dàng
                  nhận diện đơn vị đóng góp lớn vào tổng doanh số.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={zoomedChart === 'monthly'}
        onOpenChange={(open) => !open && setZoomedChart(null)}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích tiến trình theo tháng
            </DialogTitle>
            <DialogDescription className="text-xs">
              Biểu đồ trực quan và số liệu chi tiết về xu hướng tăng trưởng doanh số theo tháng.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {monthlyData.length > 0 ? (
                <ChartContainer config={monthlyChartConfig} className="h-full w-full">
                  <AreaChart
                    data={monthlyData}
                    margin={{ left: -10, right: 10, top: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id={monthlyZoomGradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.chart1} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.chart1} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray={GRID_DASH}
                      className={GRID_CLASS}
                    />
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
                            <span className="font-mono">{pieFormatter(value as number)}</span>
                          )}
                          hideLabel
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={CHART_COLORS.chart1}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#${monthlyZoomGradId})`}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Không có dữ liệu tiến trình theo tháng
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 max-h-[320px] overflow-y-auto">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết doanh số theo tháng
                </span>
                <div className="space-y-2.5">
                  {monthlyData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 font-medium">
                        Tháng {item.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">
                          {new Intl.NumberFormat().format(item.count)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Xu hướng phát triển</p>
                <div className="leading-relaxed opacity-90">
                  Xu hướng doanh số giúp theo dõi sức mua của thị trường theo chu kỳ. Từ đó, doanh
                  nghiệp có thể dự đoán nhu cầu sản xuất và điều chỉnh nguồn lực.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
