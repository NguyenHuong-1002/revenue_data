'use client';

import { ChevronDown, ChevronUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { ChartCard } from '@/components/charts/chart-card';
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
  BAR_RADIUS,
  BAR_SIZE,
  CHART_COLORS,
  CHART_DEFAULTS,
  CURSOR_STYLE,
  GENDER_COLORS,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';
import { productService } from '@/lib/services/product.service';
import type { IProductStats } from '@/lib/types/product';
import { ProductsChartsSkeleton } from './products-skeleton';

const countChartConfig = {
  count: { label: 'Số lượng', color: CHART_COLORS.chart1 },
} satisfies ChartConfig;

const GENDER_LABELS: Record<string, string> = {
  MEN: 'Nam (MEN)',
  WOM: 'Nữ (WOM)',
  BOY: 'Bé trai (BOY)',
  GIR: 'Bé gái (GIR)',
};

export function ProductsCharts() {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [systemStats, setSystemStats] = React.useState<IProductStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(false);
  const [zoomedChart, setZoomedChart] = React.useState<
    'gender' | 'age' | 'activity' | 'lifestyle' | null
  >(null);

  React.useEffect(() => {
    setIsStatsLoading(true);
    productService
      .stats()
      .then((res) => {
        setSystemStats(res.data);
      })
      .catch(() => {
        toast.error('Không thể tải phân tích trực quan toàn hệ thống.');
      })
      .finally(() => {
        setIsStatsLoading(false);
      });
  }, []);

  const genderData = React.useMemo(() => {
    if (!systemStats) return [];
    return systemStats.gender.map((item) => ({
      name: GENDER_LABELS[item.name] || item.name,
      shortName: item.name,
      value: Number(item.count),
      fill: GENDER_COLORS[item.name as keyof typeof GENDER_COLORS] || CHART_COLORS.chart1,
    }));
  }, [systemStats]);

  const ageData = React.useMemo(() => {
    if (!systemStats) return [];
    return systemStats.age_group
      .map((item) => ({ name: item.name, count: Number(item.count) }))
      .sort((a, b) => b.count - a.count);
  }, [systemStats]);

  const activityData = React.useMemo(() => {
    if (!systemStats) return [];
    return systemStats.activity_group
      .map((item) => ({ name: item.name, count: Number(item.count) }))
      .sort((a, b) => b.count - a.count);
  }, [systemStats]);

  const lifestyleData = React.useMemo(() => {
    if (!systemStats) return [];
    return systemStats.lifestyle_group
      .map((item) => ({ name: item.name, count: Number(item.count) }))
      .sort((a, b) => b.count - a.count);
  }, [systemStats]);

  const totalGender = React.useMemo(
    () => genderData.reduce((sum, item) => sum + item.value, 0),
    [genderData]
  );
  const totalAge = React.useMemo(
    () => ageData.reduce((sum, item) => sum + item.count, 0),
    [ageData]
  );
  const totalActivity = React.useMemo(
    () => activityData.reduce((sum, item) => sum + item.count, 0),
    [activityData]
  );
  const totalLifestyle = React.useMemo(
    () => lifestyleData.reduce((sum, item) => sum + item.count, 0),
    [lifestyleData]
  );

  return (
    <>
      <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-3 border-b border-border/60 py-3.5 px-5 bg-muted/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BarChart3 className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                Phân tích Trực quan Sản phẩm
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                Biểu đồ phân bố các thuộc tính trên toàn bộ cơ sở dữ liệu hệ thống. Nhấp vào mỗi
                biểu đồ để xem chi tiết phóng to.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>

        {isExpanded && (
          <CardContent className="p-5 relative">
            {isStatsLoading ? (
              <ProductsChartsSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ChartCard
                  title="Cơ cấu Giới tính"
                  icon={<PieChartIcon className="size-4" />}
                  height={160}
                  isEmpty={genderData.length === 0}
                  emptyMessage="Không có dữ liệu"
                  onClick={() => setZoomedChart('gender')}
                >
                  <ChartContainer config={countChartConfig} className="h-full w-full">
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
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, _name, item) => {
                              const data = item?.payload as
                                | { name: string; value: number }
                                | undefined;
                              return (
                                <span className="font-medium">
                                  {data?.name || ''}:{' '}
                                  <span className="font-mono">
                                    {(value as number).toLocaleString('vi-VN')}
                                  </span>{' '}
                                  sp
                                </span>
                              );
                            }}
                            hideLabel
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                </ChartCard>

                <ChartCard
                  title="Phân bố Độ tuổi"
                  height={160}
                  isEmpty={ageData.length === 0}
                  emptyMessage="Không có dữ liệu"
                  onClick={() => setZoomedChart('age')}
                >
                  <ChartContainer config={countChartConfig} className="h-full w-full">
                    <BarChart
                      data={ageData}
                      layout="vertical"
                      margin={{ left: -10, right: 10, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid
                        horizontal={false}
                        strokeDasharray={GRID_DASH}
                        className={GRID_CLASS}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={80}
                        className="text-[8px] fill-muted-foreground"
                      />
                      <ChartTooltip
                        cursor={CURSOR_STYLE}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="count"
                        fill={CHART_COLORS.chart1}
                        radius={BAR_RADIUS.horizontal}
                        barSize={BAR_SIZE.sm}
                      />
                    </BarChart>
                  </ChartContainer>
                </ChartCard>

                <ChartCard
                  title="Phân bố Hoạt động"
                  height={160}
                  isEmpty={activityData.length === 0}
                  emptyMessage="Không có dữ liệu"
                  onClick={() => setZoomedChart('activity')}
                >
                  <ChartContainer config={countChartConfig} className="h-full w-full">
                    <BarChart
                      data={activityData}
                      layout="vertical"
                      margin={{ left: -10, right: 10, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid
                        horizontal={false}
                        strokeDasharray={GRID_DASH}
                        className={GRID_CLASS}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={80}
                        className="text-[8px] fill-muted-foreground"
                      />
                      <ChartTooltip
                        cursor={CURSOR_STYLE}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="count"
                        fill={CHART_COLORS.chart2}
                        radius={BAR_RADIUS.horizontal}
                        barSize={BAR_SIZE.sm}
                      />
                    </BarChart>
                  </ChartContainer>
                </ChartCard>

                <ChartCard
                  title="Phân bố Phong cách sống"
                  height={160}
                  isEmpty={lifestyleData.length === 0}
                  emptyMessage="Không có dữ liệu"
                  onClick={() => setZoomedChart('lifestyle')}
                >
                  <ChartContainer config={countChartConfig} className="h-full w-full">
                    <BarChart
                      data={lifestyleData}
                      layout="vertical"
                      margin={{ left: -10, right: 10, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid
                        horizontal={false}
                        strokeDasharray={GRID_DASH}
                        className={GRID_CLASS}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={70}
                        className="text-[8px] fill-muted-foreground"
                      />
                      <ChartTooltip
                        cursor={CURSOR_STYLE}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="count"
                        fill={CHART_COLORS.chart4}
                        radius={BAR_RADIUS.horizontal}
                        barSize={BAR_SIZE.sm}
                      />
                    </BarChart>
                  </ChartContainer>
                </ChartCard>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog
        open={zoomedChart === 'gender'}
        onOpenChange={(open) => !open && setZoomedChart(null)}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích cơ cấu Giới tính
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Biểu đồ trực quan và số liệu chi tiết về phân bổ giới tính của sản phẩm trên toàn hệ
              thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {genderData.length > 0 ? (
                <ChartContainer config={countChartConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={CHART_DEFAULTS.pieInnerRadiusLarge}
                      outerRadius={CHART_DEFAULTS.pieOuterRadiusLarge}
                      paddingAngle={CHART_DEFAULTS.piePaddingAngleLarge}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span className="font-mono">
                              {(value as number).toLocaleString('vi-VN')} sản phẩm
                            </span>
                          )}
                          hideLabel
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">Không có dữ liệu</div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5">
                  {genderData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 flex items-center gap-2">
                        <span
                          className="size-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        {item.name}
                      </span>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-semibold text-foreground">
                          {item.value.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5">
                          ({totalGender > 0 ? ((item.value / totalGender) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Cơ cấu Giới tính</p>
                <div className="leading-relaxed opacity-90">
                  Giúp định hình nhóm đối tượng khách hàng mục tiêu để tối ưu chiến dịch marketing
                  sản phẩm.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={zoomedChart === 'age'} onOpenChange={(open) => !open && setZoomedChart(null)}>
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích phân bố Độ tuổi
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Biểu đồ trực quan và số liệu chi tiết về phân bổ độ tuổi khách hàng của sản phẩm trên
              toàn hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {ageData.length > 0 ? (
                <ChartContainer config={countChartConfig} className="h-full w-full">
                  <BarChart
                    data={ageData}
                    layout="vertical"
                    margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray={GRID_DASH}
                      className={GRID_CLASS}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={TICK_MARGIN}
                      className="text-[10px] fill-muted-foreground"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={110}
                      className="text-[10px] fill-muted-foreground"
                    />
                    <ChartTooltip
                      cursor={CURSOR_STYLE}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.chart1}
                      radius={BAR_RADIUS.horizontalLarge}
                      barSize={BAR_SIZE.lg}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">Không có dữ liệu</div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {ageData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-foreground/80 flex items-center gap-2 truncate">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_COLORS.chart1 }}
                        />
                        {item.name}
                      </span>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-xs font-semibold text-foreground">
                          {item.count.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          ({totalAge > 0 ? ((item.count / totalAge) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Phân bố Độ tuổi</p>
                <div className="leading-relaxed opacity-90">
                  Cho biết nhóm độ tuổi phổ biến nhất để tối ưu hóa thiết kế và dải kích thước sản
                  phẩm.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={zoomedChart === 'activity'}
        onOpenChange={(open) => !open && setZoomedChart(null)}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích phân bố Hoạt động
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Biểu đồ trực quan và số liệu chi tiết về mục đích/hoạt động sử dụng sản phẩm trên toàn
              hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {activityData.length > 0 ? (
                <ChartContainer config={countChartConfig} className="h-full w-full">
                  <BarChart
                    data={activityData}
                    layout="vertical"
                    margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray={GRID_DASH}
                      className={GRID_CLASS}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={TICK_MARGIN}
                      className="text-[10px] fill-muted-foreground"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={110}
                      className="text-[10px] fill-muted-foreground"
                    />
                    <ChartTooltip
                      cursor={CURSOR_STYLE}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.chart2}
                      radius={BAR_RADIUS.horizontalLarge}
                      barSize={BAR_SIZE.lg}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">Không có dữ liệu</div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {activityData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-foreground/80 flex items-center gap-2 truncate">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_COLORS.chart2 }}
                        />
                        {item.name}
                      </span>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-xs font-semibold text-foreground">
                          {item.count.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          ({totalActivity > 0 ? ((item.count / totalActivity) * 100).toFixed(1) : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Phân bố Hoạt động</p>
                <div className="leading-relaxed opacity-90">
                  Thống kê các mục đích sử dụng phổ biến (Thể thao, Văn phòng, Thường nhật) của dòng
                  sản phẩm.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={zoomedChart === 'lifestyle'}
        onOpenChange={(open) => !open && setZoomedChart(null)}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích phân bổ Phong cách sống
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Biểu đồ trực quan và số liệu chi tiết về phong cách sống của sản phẩm trên toàn hệ
              thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {lifestyleData.length > 0 ? (
                <ChartContainer config={countChartConfig} className="h-full w-full">
                  <BarChart
                    data={lifestyleData}
                    layout="vertical"
                    margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray={GRID_DASH}
                      className={GRID_CLASS}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={TICK_MARGIN}
                      className="text-[10px] fill-muted-foreground"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={100}
                      className="text-[10px] fill-muted-foreground"
                    />
                    <ChartTooltip
                      cursor={CURSOR_STYLE}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.chart4}
                      radius={BAR_RADIUS.horizontalLarge}
                      barSize={BAR_SIZE.lg}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">Không có dữ liệu</div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {lifestyleData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-foreground/80 flex items-center gap-2 truncate">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: CHART_COLORS.chart4 }}
                        />
                        {item.name}
                      </span>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-xs font-semibold text-foreground">
                          {item.count.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          (
                          {totalLifestyle > 0
                            ? ((item.count / totalLifestyle) * 100).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Phong cách sống</p>
                <div className="leading-relaxed opacity-90">
                  Xác định xu hướng phong cách (Sport, Casual, Fashion, Formal) được ưa chuộng.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
