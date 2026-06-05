'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Loader2,
  TrendingUp,
  Sparkles,
  Filter,
  Brain,
  Sliders,
  Database,
  ShoppingBag,
  Info,
  Calendar,
  LineChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { toast } from 'sonner';
import { forecastService, IForecastCombinedResponse, IChartPoint } from '@/lib/services/forecast.service';
import { cn } from '@/lib/utils';

export default function TrendForecastPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Filter States
  const [scope, setScope] = useState<'all' | 'sales' | 'inventory'>('all');
  const [periodType, setPeriodType] = useState<'month' | 'week' | 'quarter'>('month');
  const [horizon, setHorizon] = useState<number>(3);
  const [alpha, setAlpha] = useState<number>(0.3);
  const [productId, setProductId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [plantId, setPlantId] = useState<string>('');
  const [distributionChannel, setDistributionChannel] = useState<string>('all-channels');

  // API Data State
  const [forecastData, setForecastData] = useState<IForecastCombinedResponse | null>(null);

  const fetchForecast = useCallback(async (isUpdate = false) => {
    try {
      if (isUpdate) setUpdating(true);
      else setLoading(true);

      const params = {
        scope,
        periodType,
        horizon,
        alpha,
        productId: productId.trim() || undefined,
        branchId: branchId.trim() || undefined,
        plantId: plantId.trim() || undefined,
        distributionChannel: distributionChannel === 'all-channels' ? undefined : distributionChannel,
      };

      const res = await forecastService.getCombinedForecast(params);
      setForecastData(res.data);

      if (isUpdate) {
        toast.success('Đã cập nhật mô hình dự báo mới');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Không thể tải dữ liệu dự báo xu hướng';
      toast.error(errMsg);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  }, [scope, periodType, horizon, alpha, productId, branchId, plantId, distributionChannel]);

  useEffect(() => {
    fetchForecast();
  }, []);

  // Process data for charts
  // Backend chartData contains elements with type = 'actual' | 'forecast'
  // We want to format Recharts data such that actual points and forecast points can be drawn continuously.
  const salesChartData = useMemo(() => {
    if (!forecastData?.sales?.chartData) return [];
    // Convert chartData from backend to a format friendly for Recharts multi-line/area display
    return forecastData.sales.chartData.map((pt) => ({
      period: pt.period,
      actual: pt.type === 'actual' ? pt.value : null,
      ema: pt.algorithm === 'ema' ? pt.value : pt.type === 'actual' ? pt.value : null,
      linear: pt.algorithm === 'linearRegression' ? pt.value : pt.type === 'actual' ? pt.value : null,
      type: pt.type,
    }));
  }, [forecastData?.sales]);

  const inventoryChartData = useMemo(() => {
    if (!forecastData?.inventory?.chartData) return [];
    return forecastData.inventory.chartData.map((pt) => ({
      period: pt.period,
      actual: pt.type === 'actual' ? pt.value : null,
      ema: pt.algorithm === 'ema' ? pt.value : pt.type === 'actual' ? pt.value : null,
      linear: pt.algorithm === 'linearRegression' ? pt.value : pt.type === 'actual' ? pt.value : null,
      type: pt.type,
    }));
  }, [forecastData?.inventory]);

  // Find index where forecast starts
  const salesForecastStartIndex = useMemo(() => {
    if (!forecastData?.sales?.chartData) return -1;
    return forecastData.sales.chartData.findIndex(pt => pt.type === 'forecast');
  }, [forecastData?.sales]);

  const inventoryForecastStartIndex = useMemo(() => {
    if (!forecastData?.inventory?.chartData) return -1;
    return forecastData.inventory.chartData.findIndex(pt => pt.type === 'forecast');
  }, [forecastData?.inventory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">Đang mô phỏng mô hình dự báo AI...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary animate-pulse" />
            Dự báo xu hướng thông minh
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ứng dụng thuật toán Exponential Smoothing (EMA) và Hồi quy tuyến tính (Linear Regression) dự đoán doanh số & tồn kho
          </p>
        </div>
      </div>

      {/* ── Parameters & Filters Panel ── */}
      <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Cấu hình mô hình dự báo & Bộ lọc dữ liệu
          </CardTitle>
          <CardDescription className="text-xs">
            Điều chỉnh hệ số làm mượt, chu kỳ dự đoán và các chiều dữ liệu để tối ưu kết quả
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Scope */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phạm vi dự báo</Label>
              <Select value={scope} onValueChange={(val: any) => setScope(val)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Chọn phạm vi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả (Doanh số & Tồn kho)</SelectItem>
                  <SelectItem value="sales">Chỉ Doanh số (Sales)</SelectItem>
                  <SelectItem value="inventory">Chỉ Tồn kho (Inventory)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Granularity (for Sales) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Chu kỳ gom nhóm (Doanh số)</Label>
              <Select value={periodType} onValueChange={(val: any) => setPeriodType(val)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Chọn chu kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Theo tháng (Month)</SelectItem>
                  <SelectItem value="week">Theo tuần (Week)</SelectItem>
                  <SelectItem value="quarter">Theo quý (Quarter)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Horizon */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Chu kỳ dự báo (Horizon)</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={horizon}
                onChange={(e) => setHorizon(Number(e.target.value))}
                className="text-xs h-9"
              />
            </div>

            {/* Alpha smoothing factor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                Hệ số san phẳng (Alpha)
                <span className="text-[10px] text-muted-foreground">(EMA)</span>
              </Label>
              <Input
                type="number"
                step="0.05"
                min={0.01}
                max={0.99}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            {/* Product ID Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mã sản phẩm</Label>
              <Input
                placeholder="Ví dụ: P001 (Bỏ trống = tất cả)"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Branch ID Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mã chi nhánh (Doanh số)</Label>
              <Input
                placeholder="Ví dụ: BR001"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Plant ID Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mã kho hàng (Tồn kho)</Label>
              <Input
                placeholder="Ví dụ: PL001"
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {/* Distribution Channel */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kênh phân phối (Doanh số)</Label>
              <Select value={distributionChannel} onValueChange={setDistributionChannel}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Chọn kênh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-channels">Tất cả các kênh</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Bán lẻ">Bán lẻ</SelectItem>
                  <SelectItem value="Bán sỉ">Bán sỉ</SelectItem>
                  <SelectItem value="Siêu thị">Siêu thị</SelectItem>
                  <SelectItem value="Hợp đồng">Hợp đồng</SelectItem>
                  <SelectItem value="Chi nhánh">Chi nhánh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/40">
            <Button
              onClick={() => fetchForecast(true)}
              disabled={updating}
              className="gap-2 cursor-pointer shadow-xs text-xs font-semibold px-5 h-9"
            >
              {updating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang tính toán...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Cập nhật dự báo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warnings & Notices */}
      {forecastData?.warnings && forecastData.warnings.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex gap-2 items-start">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Lưu ý phân tích dữ liệu:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {forecastData.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Grid: Charts & Predictions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Forecast Chart */}
          {(scope === 'all' || scope === 'sales') && (
            <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-500" />
                  Dự báo doanh số (Lượng bán)
                </CardTitle>
                <CardDescription className="text-xs">
                  Biểu đồ hiển thị dữ liệu thực tế và hai mô hình dự báo trong tương lai
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {salesChartData.length > 0 ? (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis
                          dataKey="period"
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
                              const isForecast = payload[0].payload.type === 'forecast';
                              return (
                                <div className="bg-card border border-border p-2.5 rounded-xl shadow-md text-xs space-y-1.5">
                                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                                    {label}
                                    {isForecast ? (
                                      <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-primary/10 text-primary">Dự báo</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0">Thực tế</Badge>
                                    )}
                                  </p>
                                  {payload.map((item, idx) => {
                                    if (item.value == null) return null;
                                    return (
                                      <p key={idx} style={{ color: item.color }} className="font-medium text-[11px]">
                                        {item.name === 'actual' ? 'Thực tế: ' :
                                         item.name === 'ema' ? 'Dự báo EMA: ' : 'Hồi quy tuyến tính: '}
                                        <span className="font-bold">{Math.round(Number(item.value))} chiếc</span>
                                      </p>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconSize={10}
                          wrapperStyle={{ fontSize: '10px' }}
                        />
                        {/* Reference Line dividing actual vs forecast */}
                        {salesForecastStartIndex !== -1 && salesChartData[salesForecastStartIndex] && (
                          <ReferenceLine
                            x={salesChartData[salesForecastStartIndex].period}
                            stroke="hsl(var(--destructive))"
                            strokeDasharray="3 3"
                            label={{ value: 'Mốc dự báo', position: 'top', fill: 'hsl(var(--destructive))', fontSize: 9, fontWeight: 'bold' }}
                          />
                        )}
                        <Area
                          name="actual"
                          type="monotone"
                          dataKey="actual"
                          stroke="hsl(142.1, 76.2%, 36.3%)"
                          fill="hsl(142.1, 76.2%, 36.3%)"
                          fillOpacity={0.06}
                          strokeWidth={2.5}
                        />
                        <Area
                          name="ema"
                          type="monotone"
                          dataKey="ema"
                          stroke="hsl(262.1, 83.3%, 57.8%)"
                          fill="none"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                        />
                        <Area
                          name="linear"
                          type="monotone"
                          dataKey="linear"
                          stroke="hsl(217.2, 91.2%, 59.8%)"
                          fill="none"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[320px] border border-dashed border-border rounded-xl">
                    <span className="text-xs text-muted-foreground">Không có dữ liệu dự báo doanh số</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory Forecast Chart */}
          {(scope === 'all' || scope === 'inventory') && (
            <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  Dự báo mức tồn kho
                </CardTitle>
                <CardDescription className="text-xs">
                  Biểu đồ mô phỏng xu hướng biến động lượng hàng tồn kho dự đoán ở các chu kỳ tới
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {inventoryChartData.length > 0 ? (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={inventoryChartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis
                          dataKey="period"
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
                              const isForecast = payload[0].payload.type === 'forecast';
                              return (
                                <div className="bg-card border border-border p-2.5 rounded-xl shadow-md text-xs space-y-1.5">
                                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                                    {label}
                                    {isForecast ? (
                                      <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-primary/10 text-primary">Dự báo</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0">Thực tế</Badge>
                                    )}
                                  </p>
                                  {payload.map((item, idx) => {
                                    if (item.value == null) return null;
                                    return (
                                      <p key={idx} style={{ color: item.color }} className="font-medium text-[11px]">
                                        {item.name === 'actual' ? 'Tồn thực tế: ' :
                                         item.name === 'ema' ? 'Dự báo EMA: ' : 'Hồi quy tuyến tính: '}
                                        <span className="font-bold">{Math.round(Number(item.value))} chiếc</span>
                                      </p>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconSize={10}
                          wrapperStyle={{ fontSize: '10px' }}
                        />
                        {inventoryForecastStartIndex !== -1 && inventoryChartData[inventoryForecastStartIndex] && (
                          <ReferenceLine
                            x={inventoryChartData[inventoryForecastStartIndex].period}
                            stroke="hsl(var(--destructive))"
                            strokeDasharray="3 3"
                            label={{ value: 'Mốc dự báo', position: 'top', fill: 'hsl(var(--destructive))', fontSize: 9, fontWeight: 'bold' }}
                          />
                        )}
                        <Area
                          name="actual"
                          type="monotone"
                          dataKey="actual"
                          stroke="hsl(217.2, 91.2%, 59.8%)"
                          fill="hsl(217.2, 91.2%, 59.8%)"
                          fillOpacity={0.06}
                          strokeWidth={2.5}
                        />
                        <Area
                          name="ema"
                          type="monotone"
                          dataKey="ema"
                          stroke="hsl(262.1, 83.3%, 57.8%)"
                          fill="none"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                        />
                        <Area
                          name="linear"
                          type="monotone"
                          dataKey="linear"
                          stroke="hsl(47.9, 95.8%, 53.1%)"
                          fill="none"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[320px] border border-dashed border-border rounded-xl">
                    <span className="text-xs text-muted-foreground">Không có dữ liệu dự báo tồn kho</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (Metrics & Prediction values list) */}
        <div className="space-y-6">
          {/* Algorithms KPI details */}
          <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <LineChart className="h-4 w-4 text-purple-500" />
                Tham số & Chất lượng mô hình
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {forecastData?.sales && (
                <div className="space-y-3">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Thuật toán Doanh số (Sales)
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Lượng quan sát</p>
                      <p className="font-bold text-foreground text-sm">{forecastData.sales.observations} chu kỳ</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Alpha áp dụng</p>
                      <p className="font-bold text-foreground text-sm">{forecastData.sales.ema.alpha}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Độ dốc (Slope)</p>
                      <p className="font-bold text-foreground text-sm">
                        {Number(forecastData.sales.linearRegression.slope.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Mức cơ sở (Intercept)</p>
                      <p className="font-bold text-foreground text-sm">
                        {Math.round(forecastData.sales.linearRegression.intercept)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {forecastData?.inventory && (
                <div className="space-y-3 pt-2">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Thuật toán Tồn kho (Stock)
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Lượng quan sát</p>
                      <p className="font-bold text-foreground text-sm">{forecastData.inventory.observations} chu kỳ</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Alpha áp dụng</p>
                      <p className="font-bold text-foreground text-sm">{forecastData.inventory.ema.alpha}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Độ dốc (Slope)</p>
                      <p className="font-bold text-foreground text-sm">
                        {Number(forecastData.inventory.linearRegression.slope.toFixed(2))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Mức cơ sở (Intercept)</p>
                      <p className="font-bold text-foreground text-sm">
                        {Math.round(forecastData.inventory.linearRegression.intercept)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* List of forecasted future values */}
          <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Số liệu dự đoán tương lai
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {forecastData?.sales?.ema?.forecast && forecastData.sales.ema.forecast.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Doanh số dự báo hàng kỳ:</div>
                  {forecastData.sales.ema.forecast.map((pt, idx) => {
                    const linearVal = forecastData.sales?.linearRegression?.forecast?.[idx]?.value ?? 0;
                    return (
                      <div key={idx} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex flex-col gap-1 hover:bg-muted/40 transition-all">
                        <div className="flex justify-between items-center text-xs font-bold text-foreground">
                          <span>Chu kỳ: {pt.period}</span>
                          <span className="text-purple-500">EMA: {Math.round(pt.value)} sp</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Dự báo hồi quy tuyến tính:</span>
                          <span>Hồi quy: {Math.round(linearVal)} sp</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {forecastData?.inventory?.ema?.forecast && forecastData.inventory.ema.forecast.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Tồn kho dự báo hàng ngày:</div>
                  {forecastData.inventory.ema.forecast.map((pt, idx) => {
                    const linearVal = forecastData.inventory?.linearRegression?.forecast?.[idx]?.value ?? 0;
                    return (
                      <div key={idx} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex flex-col gap-1 hover:bg-muted/40 transition-all">
                        <div className="flex justify-between items-center text-xs font-bold text-foreground">
                          <span>Ngày dự đoán: {pt.period}</span>
                          <span className="text-purple-500">EMA: {Math.round(pt.value)} sp</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Dự báo hồi quy tuyến tính:</span>
                          <span>Hồi quy: {Math.round(linearVal)} sp</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {(!forecastData?.sales && !forecastData?.inventory) && (
                <div className="text-xs text-muted-foreground text-center py-6">
                  Không có điểm dữ liệu dự báo tương lai nào được tính toán.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
