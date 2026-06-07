'use client';

import { TrendingUp, TrendingDown, Minus, Lightbulb, ArrowRight, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IForecastDatasetResult } from '@/lib/services/forecast.service';

interface ForecastSummaryProps {
  sales: IForecastDatasetResult | null;
  inventory: IForecastDatasetResult | null;
  scope: 'all' | 'sales' | 'inventory';
}

export function ForecastSummary({ sales, inventory, scope }: ForecastSummaryProps) {
  // Helper to calculate trend metrics
  const getTrendMetrics = (data: IForecastDatasetResult | null) => {
    if (!data || !data.history || data.history.length === 0) return null;

    const lastActual = data.history[data.history.length - 1].value;
    
    // Linear regression metrics
    const slope = data.linearRegression?.slope ?? 0;
    const linearForecasts = data.linearRegression?.forecast || [];
    
    // Calculate average forecast value from Linear Regression
    const avgLinearForecast = linearForecasts.length > 0
      ? linearForecasts.reduce((sum, item) => sum + item.value, 0) / linearForecasts.length
      : lastActual;

    const finalLinearForecast = linearForecasts.length > 0
      ? linearForecasts[linearForecasts.length - 1].value
      : lastActual;

    // Determine trend direction based on linear regression slope
    let trendDirection: 'up' | 'down' | 'flat' = 'flat';
    if (slope > 0.05 * lastActual / 10) trendDirection = 'up'; 
    else if (slope < -0.05 * lastActual / 10) trendDirection = 'down';

    // Projected change percentage based on the average future regression path vs last actual
    const pctChange = ((avgLinearForecast - lastActual) / (lastActual || 1)) * 100;

    return {
      lastActual,
      avgLinearForecast,
      finalLinearForecast,
      slope,
      trendDirection,
      pctChange,
    };
  };

  const salesMetrics = getTrendMetrics(sales);
  const inventoryMetrics = getTrendMetrics(inventory);

  const renderSalesCard = () => {
    if (!salesMetrics) return null;

    const { lastActual, avgLinearForecast, slope, trendDirection, pctChange } = salesMetrics;
    const isUp = trendDirection === 'up';
    const isDown = trendDirection === 'down';

    // Build recommendation text
    let recommendation = '';
    if (isUp) {
      recommendation = 'Xu hướng doanh số đang tăng trưởng tốt. Cần lên kế hoạch nhập thêm nguyên vật liệu và tối ưu năng lực sản xuất để đáp ứng nhu cầu thị trường.';
    } else if (isDown) {
      recommendation = 'Dự báo doanh số có xu hướng giảm nhẹ. Cân nhắc triển khai các chương trình khuyến mãi kích cầu hoặc giảm sản lượng sản xuất để tránh tồn kho thừa.';
    } else {
      recommendation = 'Doanh số dự kiến sẽ giữ ở mức ổn định. Tiếp tục theo dõi biến động thị trường và duy trì kế hoạch vận hành hiện tại.';
    }

    return (
      <Card className="border border-border/80 bg-card/40 backdrop-blur-xs relative overflow-hidden group">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <CardContent className="pt-6 pb-5 px-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Xu hướng doanh số dự kiến
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1">Dự báo Bán hàng (Sales)</h3>
            </div>
            
            {/* Status Badge */}
            {isUp && (
              <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
                <TrendingUp className="size-3.5" />
                Tăng trưởng (+{pctChange.toFixed(1)}%)
              </Badge>
            )}
            {isDown && (
              <Badge className="bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
                <TrendingDown className="size-3.5" />
                Suy giảm ({pctChange.toFixed(1)}%)
              </Badge>
            )}
            {trendDirection === 'flat' && (
              <Badge className="bg-muted text-muted-foreground border border-border gap-1 font-semibold text-xs py-1 px-2.5">
                <Minus className="size-3.5" />
                Ổn định ({pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%)
              </Badge>
            )}
          </div>

          {/* Grid Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Thực tế gần nhất</p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {Math.round(lastActual).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">sp</span>
              </p>
            </div>
            <div className="border-l border-border/50 pl-3">
              <p className="text-[10px] text-muted-foreground font-medium">Dự báo TB tương lai</p>
              <p className="text-base font-bold text-primary mt-0.5">
                {Math.round(avgLinearForecast).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">sp</span>
              </p>
            </div>
            <div className="border-l border-border/50 pl-3">
              <p className="text-[10px] text-muted-foreground font-medium">Tốc độ thay đổi (Slope)</p>
              <p className={`text-base font-bold mt-0.5 ${slope > 0 ? 'text-emerald-600 dark:text-emerald-400' : slope < 0 ? 'text-red-500' : 'text-foreground'}`}>
                {slope > 0 ? '+' : ''}{slope.toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">sp/kỳ</span>
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex gap-2.5 items-start bg-emerald-500/5 dark:bg-emerald-500/2 p-3 rounded-xl border border-emerald-500/10">
            <Lightbulb className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Gợi ý hành động: </span>
              {recommendation}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInventoryCard = () => {
    if (!inventoryMetrics) return null;

    const { lastActual, avgLinearForecast, slope, trendDirection, pctChange } = inventoryMetrics;
    const isAccumulating = slope > 0.05 * lastActual / 10;
    const isDepleting = slope < -0.05 * lastActual / 10;

    let recommendation = '';
    if (isAccumulating) {
      recommendation = 'Lượng tồn kho đang tích tụ lũy kế. Hãy rà soát lại tiến độ đặt hàng từ nhà máy hoặc đẩy mạnh kênh bán lẻ để tối ưu chi phí lưu kho, tránh ứ đọng vốn.';
    } else if (isDepleting) {
      recommendation = 'Mức tồn kho đang suy giảm nhanh. Cần chuẩn bị kế hoạch bổ sung nguồn cung (nhập kho mới) sớm để tránh nguy cơ đứt gãy chuỗi cung ứng, cháy hàng.';
    } else {
      recommendation = 'Tồn kho được dự báo duy trì cân bằng ổn định. Tiếp tục áp dụng mức tồn kho an toàn (safety stock) hiện tại.';
    }

    return (
      <Card className="border border-border/80 bg-card/40 backdrop-blur-xs relative overflow-hidden group">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
        <CardContent className="pt-6 pb-5 px-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Xu hướng tồn kho dự kiến
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1">Dự báo Tồn kho (Stock)</h3>
            </div>
            
            {/* Status Badge */}
            {isAccumulating && (
              <Badge className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
                <ShieldAlert className="size-3.5" />
                Tích lũy tồn (+{pctChange.toFixed(1)}%)
              </Badge>
            )}
            {isDepleting && (
              <Badge className="bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 gap-1 font-semibold text-xs py-1 px-2.5">
                <TrendingDown className="size-3.5" />
                Giải phóng kho ({pctChange.toFixed(1)}%)
              </Badge>
            )}
            {!isAccumulating && !isDepleting && (
              <Badge className="bg-muted text-muted-foreground border border-border gap-1 font-semibold text-xs py-1 px-2.5">
                <Minus className="size-3.5" />
                Duy trì ổn định ({pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%)
              </Badge>
            )}
          </div>

          {/* Grid Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Thực tế gần nhất</p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {Math.round(lastActual).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">sp</span>
              </p>
            </div>
            <div className="border-l border-border/50 pl-3">
              <p className="text-[10px] text-muted-foreground font-medium">Dự báo TB tương lai</p>
              <p className="text-base font-bold text-primary mt-0.5">
                {Math.round(avgLinearForecast).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">sp</span>
              </p>
            </div>
            <div className="border-l border-border/50 pl-3">
              <p className="text-[10px] text-muted-foreground font-medium">Tốc độ thay đổi (Slope)</p>
              <p className={`text-base font-bold mt-0.5 ${slope > 0 ? 'text-amber-500' : slope < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                {slope > 0 ? '+' : ''}{slope.toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">sp/ngày</span>
              </p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex gap-2.5 items-start bg-blue-500/5 dark:bg-blue-500/2 p-3 rounded-xl border border-blue-500/10">
            <Lightbulb className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-blue-700 dark:text-blue-400">Gợi ý hành động: </span>
              {recommendation}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const showSales = scope === 'all' || scope === 'sales';
  const showInventory = scope === 'all' || scope === 'inventory';

  return (
    <div className={`grid grid-cols-1 ${showSales && showInventory ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
      {showSales && renderSalesCard()}
      {showInventory && renderInventoryCard()}
    </div>
  );
}
