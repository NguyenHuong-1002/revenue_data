'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  ShoppingBag,
  Activity,
  RefreshCw,
  Building2,
  Package,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { saleReportService } from '@/lib/services/sale-report.service';
import { cn } from '@/lib/utils';
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
import { toast } from 'sonner';

// Helper function to generate a readable name for a product
function getProductDisplayName(product: {
  detail_product_group: string;
  gender: string;
  color: string;
  size: number;
}) {
  if (!product.detail_product_group) return 'Đang cập nhật...';
  
  const groupNames: Record<string, string> = {
    SANTD: 'Sneaker SANTD',
    DEPTD: 'Dép xuồng DEPTD',
    GTTPC: 'Giày Thể Thao GTTPC',
    GTTCD: 'Giày Thể Thao GTTCD',
    SANTR: 'Sneaker Chạy Bộ SANTR',
    GIATR: 'Giày Tây/Da GIATR',
    PKIEN: 'Phụ Kiện PKIEN',
    TBLTH: 'Thiết Bị Luyện Tập TBLTH',
    TBLTR: 'Thiết Bị Ngoài Trời TBLTR',
  };

  const genderNames: Record<string, string> = {
    MEN: 'Nam',
    WOM: 'Nữ',
    BOY: 'Bé trai',
    GIR: 'Bé gái',
  };

  const group = groupNames[product.detail_product_group] || `Sản phẩm ${product.detail_product_group}`;
  const gender = genderNames[product.gender] || product.gender;

  return `${group} ${gender} (${product.color}, Cỡ ${product.size})`;
}

export default function RevenueStatsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllBranches, setShowAllBranches] = useState(false);

  // Revenue KPIs State
  const [kpis, setKpis] = useState<{
    totalRevenue: number;
    growthRate: number;
    topProductByRevenue: {
      id: string;
      name: string;
      revenue: number;
      detail_product_group: string;
      gender: string;
      color: string;
      size: number;
    };
    topProductByQuantity: {
      id: string;
      name: string;
      quantity: number;
      detail_product_group: string;
      gender: string;
      color: string;
      size: number;
    };
  }>({
    totalRevenue: 0,
    growthRate: 0,
    topProductByRevenue: { id: '', name: '', revenue: 0, detail_product_group: '', gender: '', color: '', size: 0 },
    topProductByQuantity: { id: '', name: '', quantity: 0, detail_product_group: '', gender: '', color: '', size: 0 },
  });

  // Chart & Breakdown Data State
  const [charts, setCharts] = useState<{
    distribution_channel: { name: string; count: number }[];
    monthly_sales: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  }>({
    distribution_channel: [],
    monthly_sales: [],
    top_branches: [],
  });

  // Highlight Products Lists State (Top & Bottom 10 lists)
  const [highlights, setHighlights] = useState<{
    topRevenue: any[];
    bottomRevenue: any[];
    topQuantity: any[];
    bottomQuantity: any[];
    topGrowth: any[];
    bottomGrowth: any[];
  }>({
    topRevenue: [],
    bottomRevenue: [],
    topQuantity: [],
    bottomQuantity: [],
    topGrowth: [],
    bottomGrowth: [],
  });

  const [activeTab, setActiveTab] = useState<'topRevenue' | 'bottomRevenue' | 'topQuantity' | 'bottomQuantity' | 'topGrowth' | 'bottomGrowth'>('topRevenue');

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [kpisRes, chartsRes, highlightsRes] = await Promise.all([
        saleReportService.getRevenueStats(),
        saleReportService.getStats(),
        saleReportService.getHighlightProductsStats(),
      ]);

      setKpis(kpisRes.data);
      setCharts(chartsRes.data);
      setHighlights(highlightsRes.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu thống kê doanh thu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const topBestSellingProducts = React.useMemo(() => {
    if (!highlights.topQuantity || highlights.topQuantity.length === 0) return [];
    // Lấy 5 sản phẩm bán chạy nhất theo số lượng (top 5 quantity)
    const top5ByQty = highlights.topQuantity.slice(0, 5);
    // Xếp theo doanh thu (sorted by revenue DESC)
    return [...top5ByQty].sort((a, b) => b.revenue - a.revenue);
  }, [highlights.topQuantity]);

  // Color mapping helper for channels
  const getChannelColor = (name: string) => {
    const colors: Record<string, string> = {
      'Online': 'hsl(217.2, 91.2%, 59.8%)',
      'Bán lẻ': 'hsl(346.8, 77.2%, 49.8%)',
      'Phát sinh': 'hsl(173.4, 80.4%, 40%)',
      'Bán sỉ': 'hsl(262.1, 83.3%, 57.8%)',
      'Siêu thị': 'hsl(47.9, 95.8%, 53.1%)',
      'Hợp đồng': 'hsl(25, 95%, 53%)',
      'Chi nhánh': 'hsl(142.1, 76.2%, 36.3%)',
      'Đổi trả / Hoàn hàng': 'hsl(0, 84.2%, 60.2%)',
    };
    return colors[name] || 'var(--primary)';
  };

  const visibleBranches = showAllBranches ? charts.top_branches : charts.top_branches.slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">Đang tải báo cáo phân tích...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Thống kê & Phân tích doanh thu</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Báo cáo tổng quan hoạt động tài chính, tốc độ tăng trưởng và hiệu suất bán hàng
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Làm mới số liệu
        </Button>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng doanh thu */}
        <Card className="border border-border/80 bg-card/30 backdrop-blur-xs relative overflow-hidden group hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Tổng doanh thu</CardDescription>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-extrabold text-foreground">
              {new Intl.NumberFormat('vi-VN').format(kpis.totalRevenue)} đ
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {kpis.growthRate !== 0 ? (
                <>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                    kpis.growthRate > 0 
                      ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20" 
                      : "text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/25"
                  )}>
                    {kpis.growthRate > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpis.growthRate > 0 ? "+" : ""}
                    {kpis.growthRate}%
                  </span>
                  <span className="text-[10px] text-muted-foreground">So với tháng trước</span>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground">Dữ liệu tháng đầu tiên</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Tốc độ tăng trưởng */}
        <Card className="border border-border/80 bg-card/30 backdrop-blur-xs relative overflow-hidden group hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Tốc độ tăng trưởng</CardDescription>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-extrabold text-foreground">
              {kpis.growthRate > 0 ? "+" : ""}
              {kpis.growthRate}%
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Hiệu suất xu hướng tháng gần nhất
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Sản phẩm doanh thu cao nhất */}
        <Card className="border border-border/80 bg-card/30 backdrop-blur-xs relative overflow-hidden group hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Doanh thu cao nhất</CardDescription>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-sm font-extrabold text-foreground line-clamp-1" title={getProductDisplayName(kpis.topProductByRevenue)}>
              {getProductDisplayName(kpis.topProductByRevenue)}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-2">
              <span>Mã: {kpis.topProductByRevenue.id || 'N/A'}</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('vi-VN').format(kpis.topProductByRevenue.revenue)} đ
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Sản phẩm bán chạy nhất */}
        <Card className="border border-border/80 bg-card/30 backdrop-blur-xs relative overflow-hidden group hover:border-border transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Bán chạy nhất (SL)</CardDescription>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-sm font-extrabold text-foreground line-clamp-1" title={getProductDisplayName(kpis.topProductByQuantity)}>
              {getProductDisplayName(kpis.topProductByQuantity)}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center justify-between mt-2">
              <span>Mã: {kpis.topProductByQuantity.id || 'N/A'}</span>
              <span className="font-bold text-primary">
                {kpis.topProductByQuantity.quantity} sản phẩm
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh số hàng tháng (Area Chart) */}
        <Card className="lg:col-span-2 border border-border/80 bg-card/35 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tiến độ doanh số theo tháng (Số lượng bán)
            </CardTitle>
            <CardDescription className="text-xs">Số lượng sản phẩm phân phối trong 6 chu kỳ gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {charts.monthly_sales.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.monthly_sales}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-[10px] text-muted-foreground fill-muted-foreground"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-[10px] text-muted-foreground fill-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border p-2.5 rounded-xl shadow-md text-xs space-y-1">
                              <p className="font-semibold text-foreground">{label}</p>
                              <p className="text-primary font-bold">
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
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] border border-dashed border-border rounded-xl">
                <span className="text-xs text-muted-foreground">Không có dữ liệu xu hướng doanh số</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phân phối theo kênh (Bar Chart) */}
        <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Sản lượng theo kênh phân phối
            </CardTitle>
            <CardDescription className="text-xs">So sánh lượng hàng bán được giữa các kênh</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            {charts.distribution_channel.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.distribution_channel} layout="vertical">
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      className="text-[9px] text-muted-foreground fill-muted-foreground"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                      width={90}
                      className="text-[10px] text-foreground font-semibold fill-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border p-2.5 rounded-xl shadow-md text-xs">
                              <p className="font-semibold text-foreground mb-0.5">{label}</p>
                              <p className="text-primary font-bold">
                                Số lượng bán: {payload[0].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                      {charts.distribution_channel.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getChannelColor(entry.name)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] border border-dashed border-border rounded-xl">
                <span className="text-xs text-muted-foreground">Không có dữ liệu kênh phân phối</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Section: Phân tích sản phẩm tiêu biểu (6 nhóm Top/Bottom 10) ── */}
      <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-500" />
            Bảng xếp hạng sản phẩm tiêu biểu
          </CardTitle>
          <CardDescription className="text-xs">Phân tích top 10 sản phẩm theo các tiêu chí doanh thu, sản lượng và tăng trưởng</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Tabs header */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-border/50 pb-4">
            {[
              { key: 'topRevenue', label: 'Cực đại doanh thu' },
              { key: 'bottomRevenue', label: 'Doanh thu thấp nhất' },
              { key: 'topQuantity', label: 'Tiêu thụ lớn nhất' },
              { key: 'bottomQuantity', label: 'Tiêu thụ ít nhất' },
              { key: 'topGrowth', label: 'Tăng trưởng nhanh nhất' },
              { key: 'bottomGrowth', label: 'Tăng trưởng tệ nhất' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content list */}
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
            {highlights[activeTab]?.length > 0 ? (
              highlights[activeTab].map((item, index) => {
                const displayName = getProductDisplayName(item);
                const isTopType = activeTab.startsWith('top');
                
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/20 border border-border/60 rounded-xl hover:border-border transition-all hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border",
                        isTopType
                          ? index === 0 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                            index === 1 ? "bg-slate-300/30 text-slate-600 dark:text-slate-400 border-slate-300/40" :
                            "bg-primary/10 text-primary border-primary/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      )}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs md:text-sm truncate" title={displayName}>
                          {displayName}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Mã sản phẩm: {item.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      {/* Metric rendering based on active tab */}
                      {activeTab === 'topRevenue' || activeTab === 'bottomRevenue' ? (
                        <div className="text-right">
                          <span className="font-bold text-foreground text-sm">
                            {new Intl.NumberFormat('vi-VN').format(item.revenue)} đ
                          </span>
                          <span className="block text-[10px] text-muted-foreground text-right">
                            Đã bán: {item.quantity} chiếc
                          </span>
                        </div>
                      ) : activeTab === 'topQuantity' || activeTab === 'bottomQuantity' ? (
                        <div className="text-right">
                          <span className="font-bold text-foreground text-sm">
                            {item.quantity} sản phẩm
                          </span>
                          <span className="block text-[10px] text-muted-foreground text-right">
                            Doanh thu: {new Intl.NumberFormat('vi-VN').format(item.revenue)} đ
                          </span>
                        </div>
                      ) : (
                        // Growth stats (percentage MoM + sold quantity difference)
                        <div className="text-right flex items-center gap-4">
                          <div className="text-[10px] text-muted-foreground text-left hidden sm:block">
                            <div>Tháng này: <span className="font-semibold text-foreground">{item.qty1} chiếc</span></div>
                            <div>Tháng trước: <span className="font-semibold text-foreground">{item.qty2} chiếc</span></div>
                          </div>
                          
                          <div className="text-right space-y-0.5">
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 justify-end",
                              item.growthPercent > 0 
                                ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20" 
                                : item.growthPercent < 0 
                                  ? "text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/20"
                                  : "text-muted-foreground bg-muted border border-border"
                            )}>
                              {item.growthPercent > 0 ? "+" : ""}
                              {item.growthPercent}%
                            </span>
                            
                            <span className={cn(
                              "block text-[10px] font-medium text-right",
                              item.qtyDiff > 0 ? "text-emerald-600 dark:text-emerald-400" : item.qtyDiff < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                            )}>
                              {item.qtyDiff > 0 ? "+" : ""}
                              {item.qtyDiff} sp so với tháng trước
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl">
                <span className="text-xs text-muted-foreground">Không có dữ liệu xếp hạng sản phẩm</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Branches & Top Products Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: Hiệu suất chi nhánh */}
        <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              Sản lượng bán theo chi nhánh
            </CardTitle>
            <CardDescription className="text-xs">Xếp hạng chi nhánh phân phối được lượng hàng cao nhất</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 px-5">
            {charts.top_branches.length > 0 ? (
              <div className="space-y-4">
                {visibleBranches.map((branch, index) => {
                  const maxCount = Math.max(...charts.top_branches.map((b) => b.count), 1);
                  const percentage = (branch.count / maxCount) * 100;
                  return (
                    <div key={branch.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground flex items-center gap-2">
                          <span className={cn(
                            "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                            index === 0 ? "bg-amber-500/20 text-amber-500" :
                            index === 1 ? "bg-slate-300/30 text-slate-500" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {index + 1}
                          </span>
                          Chi nhánh: {branch.name}
                        </span>
                        <span className="text-primary font-bold">{branch.count} sản phẩm</span>
                      </div>
                      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {charts.top_branches.length > 5 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllBranches(!showAllBranches)}
                      className="text-xs text-primary font-semibold gap-1 hover:bg-primary/5 cursor-pointer"
                    >
                      {showAllBranches ? 'Thu gọn' : `Xem tất cả (${charts.top_branches.length - 5} chi nhánh khác)`}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-xl">
                <span className="text-xs text-muted-foreground">Không có dữ liệu chi nhánh</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cột 2: Top 5 sản phẩm bán chạy nhất */}
        <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              Top 5 sản phẩm bán chạy nhất
            </CardTitle>
            <CardDescription className="text-xs">
              5 sản phẩm bán chạy nhất, hiển thị doanh thu và số lượng (xếp theo doanh thu)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 px-5 space-y-3.5">
            {topBestSellingProducts.length > 0 ? (
              topBestSellingProducts.map((item, index) => {
                const displayName = getProductDisplayName(item);
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/20 border border-border/50 rounded-xl hover:border-border transition-all">
                    <span className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold border mt-0.5",
                      index === 0 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                      index === 1 ? "bg-slate-300/30 text-slate-600 dark:text-slate-400 border-slate-300/40" :
                      "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-xs md:text-sm truncate" title={displayName}>
                        {displayName}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>Mã: {item.id}</span>
                        <span>Đã bán: <span className="font-semibold text-foreground">{item.quantity} chiếc</span></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-primary text-xs md:text-sm">
                        {new Intl.NumberFormat('vi-VN').format(item.revenue)} đ
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-xl">
                <span className="text-xs text-muted-foreground">Không có dữ liệu sản phẩm bán chạy</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
