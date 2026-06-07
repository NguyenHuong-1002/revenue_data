'use client';

import { Database, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { forecastService, IForecastCombinedResponse } from '@/lib/services/forecast.service';
import { ForecastChart } from './components/forecast-chart';
import { ForecastFilters } from './components/forecast-filters';
import { AlgorithmDetails } from './components/algorithm-details';
import { ForecastGuide } from './components/forecast-guide';
import { ForecastValuesList } from './components/forecast-values-list';
import { ForecastWarnings } from './components/forecast-warnings';
import { ModelMetrics } from './components/model-metrics';
import { TrendForecastHeader } from './components/trend-forecast-header';
import { ForecastSummary } from './components/forecast-summary';

function TrendForecastInner() {
  const searchParams = useSearchParams();
  const initialScope = (searchParams.get('scope') as 'all' | 'sales' | 'inventory') ?? 'all';

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ── Filter state ──────────────────────────────────────────────────────
  const [scope, setScope] = useState<'all' | 'sales' | 'inventory'>(initialScope);
  const [periodType, setPeriodType] = useState<'month' | 'week' | 'quarter'>('month');
  const [horizon, setHorizon] = useState<number>(3);
  const [productId, setProductId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [plantId, setPlantId] = useState<string>('');
  const [distributionChannel, setDistributionChannel] = useState<string>('all-channels');

  // ── API data ──────────────────────────────────────────────────────────
  const [forecastData, setForecastData] = useState<IForecastCombinedResponse | null>(null);

  const fetchForecast = useCallback(
    async (isUpdate = false) => {
      try {
        if (isUpdate) setUpdating(true);
        else setLoading(true);

        const params = {
          scope,
          periodType,
          horizon,
          productId: productId.trim() || undefined,
          branchId: branchId.trim() || undefined,
          plantId: plantId.trim() || undefined,
          distributionChannel:
            distributionChannel === 'all-channels' ? undefined : distributionChannel,
        };

        const res = await forecastService.getCombinedForecast(params);
        setForecastData(res.data);

        if (isUpdate) toast.success('Đã cập nhật mô hình dự báo mới');
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const errMsg = err.response?.data?.message || 'Không thể tải dữ liệu dự báo xu hướng';
        toast.error(errMsg);
      } finally {
        setLoading(false);
        setUpdating(false);
      }
    },
    [scope, periodType, horizon, productId, branchId, plantId, distributionChannel]
  );

  // Keep a ref so onApply always calls the latest fetchForecast
  // (avoids stale-closure where the button captured an outdated version)
  const fetchForecastRef = React.useRef(fetchForecast);
  useEffect(() => {
    fetchForecastRef.current = fetchForecast;
  }, [fetchForecast]);

  // Initial load — runs once on mount
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    fetchForecast();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Process chart data ────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const salesChartData = useMemo(() => {
    if (!forecastData?.sales?.chartData) return [];

    const tempMap: Record<
      string,
      {
        period: string;
        actual: number | null;
        ema: number | null;
        linear: number | null;
        type: 'actual' | 'forecast';
      }
    > = {};

    forecastData.sales.chartData.forEach((pt) => {
      if (!tempMap[pt.period]) {
        tempMap[pt.period] = {
          period: pt.period,
          actual: null,
          ema: null,
          linear: null,
          type: pt.type,
        };
      }

      if (pt.type === 'actual') {
        tempMap[pt.period].actual = pt.value;
        tempMap[pt.period].ema = pt.value;
        tempMap[pt.period].linear = pt.value;
      } else {
        tempMap[pt.period].type = 'forecast';
        if (pt.algorithm === 'ema') {
          tempMap[pt.period].ema = pt.value;
        } else if (pt.algorithm === 'linearRegression') {
          tempMap[pt.period].linear = pt.value;
        }
      }
    });

    const periodsOrder: string[] = [];
    forecastData.sales.chartData.forEach((pt) => {
      if (!periodsOrder.includes(pt.period)) {
        periodsOrder.push(pt.period);
      }
    });

    return periodsOrder.map((p) => tempMap[p]);
  }, [forecastData?.sales?.chartData]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const inventoryChartData = useMemo(() => {
    if (!forecastData?.inventory?.chartData) return [];

    const tempMap: Record<
      string,
      {
        period: string;
        actual: number | null;
        ema: number | null;
        linear: number | null;
        type: 'actual' | 'forecast';
      }
    > = {};

    forecastData.inventory.chartData.forEach((pt) => {
      if (!tempMap[pt.period]) {
        tempMap[pt.period] = {
          period: pt.period,
          actual: null,
          ema: null,
          linear: null,
          type: pt.type,
        };
      }

      if (pt.type === 'actual') {
        tempMap[pt.period].actual = pt.value;
        tempMap[pt.period].ema = pt.value;
        tempMap[pt.period].linear = pt.value;
      } else {
        tempMap[pt.period].type = 'forecast';
        if (pt.algorithm === 'ema') {
          tempMap[pt.period].ema = pt.value;
        } else if (pt.algorithm === 'linearRegression') {
          tempMap[pt.period].linear = pt.value;
        }
      }
    });

    const periodsOrder: string[] = [];
    forecastData.inventory.chartData.forEach((pt) => {
      if (!periodsOrder.includes(pt.period)) {
        periodsOrder.push(pt.period);
      }
    });

    return periodsOrder.map((p) => tempMap[p]);
  }, [forecastData?.inventory?.chartData]);

  const salesForecastStartIndex = useMemo(
    () => forecastData?.sales?.chartData?.findIndex((pt) => pt.type === 'forecast') ?? -1,
    [forecastData?.sales?.chartData]
  );

  const inventoryForecastStartIndex = useMemo(
    () => forecastData?.inventory?.chartData?.findIndex((pt) => pt.type === 'forecast') ?? -1,
    [forecastData?.inventory?.chartData]
  );

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4 w-full max-w-xl">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-6 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 rounded-xl shrink-0" />
        </div>

        {/* Filters Panel Skeleton */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Large Chart Skeleton */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-44 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>

        {/* Guide Skeleton */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col gap-4">
          <Skeleton className="h-4 w-48 rounded-md" />
          <div className="flex flex-col gap-6 pl-1 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-5/6 rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <TrendForecastHeader />

      {/* Filters / Model config panel */}
      <ForecastFilters
        scope={scope}
        periodType={periodType}
        horizon={horizon}
        productId={productId}
        branchId={branchId}
        plantId={plantId}
        distributionChannel={distributionChannel}
        updating={updating}
        onScopeChange={setScope}
        onPeriodTypeChange={setPeriodType}
        onHorizonChange={setHorizon}
        onProductIdChange={setProductId}
        onBranchIdChange={setBranchId}
        onPlantIdChange={setPlantId}
        onDistributionChannelChange={setDistributionChannel}
        onApply={() => fetchForecastRef.current(true)}
      />

      {/* Warnings banner */}
      <ForecastWarnings warnings={forecastData?.warnings ?? []} />

      {/* Forecast Trend Insights / Summary */}
      <ForecastSummary
        sales={forecastData?.sales ?? null}
        inventory={forecastData?.inventory ?? null}
        scope={scope}
      />

      {/* Charts + Metrics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: charts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {(scope === 'all' || scope === 'sales') && (
            <ForecastChart
              title="Dự báo doanh số (Lượng bán)"
              description="Biểu đồ hiển thị dữ liệu thực tế và hai mô hình dự báo trong tương lai"
              icon={<ShoppingBag className="h-4 w-4 text-chart-2" />}
              data={salesChartData}
              forecastStartIndex={salesForecastStartIndex}
              actualColor="var(--chart-2)"
              actualLabel="Thực tế"
              unit="chiếc"
            />
          )}

          {(scope === 'all' || scope === 'inventory') && (
            <ForecastChart
              title="Dự báo mức tồn kho"
              description="Biểu đồ mô phỏng xu hướng biến động lượng hàng tồn kho dự đoán ở các chu kỳ tới"
              icon={<Database className="h-4 w-4 text-primary" />}
              data={inventoryChartData}
              forecastStartIndex={inventoryForecastStartIndex}
              actualColor="var(--chart-1)"
              actualLabel="Tồn thực tế"
              unit="chiếc"
            />
          )}
        </div>

        {/* Right: model quality + future values list (1/3 width) */}
        <div className="space-y-6">
          <ModelMetrics
            sales={forecastData?.sales ?? null}
            inventory={forecastData?.inventory ?? null}
          />
          <ForecastValuesList
            sales={forecastData?.sales ?? null}
            inventory={forecastData?.inventory ?? null}
          />
        </div>
      </div>

      {/* Stepper Guide */}
      <ForecastGuide />

      {/* Algorithm Details */}
      <AlgorithmDetails />
    </div>
  );
}

export default function TrendForecastPage() {
  return (
    <Suspense fallback={null}>
      <TrendForecastInner />
    </Suspense>
  );
}
