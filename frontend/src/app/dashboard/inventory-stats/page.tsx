'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { BarChart3, AlertTriangle, Brain, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { inventoryReportService } from '@/lib/services/inventory-report.service';
import { productService } from '@/lib/services/product.service';
import { plantService } from '@/lib/services/plant.service';

import { InventoryStatsSkeleton } from './components/inventory-stats-skeleton';
import { InventoryHeader } from './components/inventory-header';
import { TimeRangeFilter } from './components/time-range-filter';
import { OverviewTab } from './components/overview-tab';
import { AlertsTab } from './components/alerts-tab';

import {
  type Kpis,
  type Rankings,
  type Alerts,
  type PageTab,
  type TimeRange,
  getDateRange,
} from './components/types';

export default function InventoryStatsPage() {
  const [activeTab, setActiveTab] = useState<PageTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [alerts, setAlerts] = useState<Alerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [plantMap, setPlantMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async (range: TimeRange, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const dateParams = getDateRange(range);

      const [kpisRes, rankingsRes, alertsRes, productsRes, plantsRes] = await Promise.allSettled([
        inventoryReportService.getKpis(dateParams),
        inventoryReportService.getRankings(10, dateParams),
        inventoryReportService.getAlerts(50, 10000, dateParams),
        productService.list({ limit: 500 }),
        plantService.list({ limit: 200 }),
      ]);

      if (kpisRes.status === 'fulfilled') setKpis(kpisRes.value.data);
      if (rankingsRes.status === 'fulfilled') setRankings(rankingsRes.value.data);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data);

      if (productsRes.status === 'fulfilled') {
        const map: Record<string, string> = {};
        (productsRes.value.data?.data ?? []).forEach((p: any) => {
          map[p.product_id] = [p.color, p.gender, p.size ? `Size ${p.size}` : '']
            .filter(Boolean)
            .join(' · ');
        });
        setProductMap(map);
      }

      if (plantsRes.status === 'fulfilled') {
        const map: Record<string, string> = {};
        (plantsRes.value.data?.data ?? []).forEach((p: any) => {
          map[p.plant_id] = p.name_plant ?? p.plant_id;
        });
        setPlantMap(map);
      }

      if (isRefresh) toast.success('Đã làm mới dữ liệu tồn kho');
    } catch {
      toast.error('Không thể tải dữ liệu thống kê tồn kho');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData, timeRange]);

  if (loading) return <InventoryStatsSkeleton />;

  const tabs: { key: PageTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
    {
      key: 'alerts',
      label: `Cảnh báo${alerts?.totalAlerts ? ` (${alerts.totalAlerts})` : ''}`,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <InventoryHeader refreshing={refreshing} onRefresh={() => loadData(timeRange, true)} />

      {/* ── Time Range Filter ── */}
      <TimeRangeFilter value={timeRange} onChange={setTimeRange} />

      {/* ── Tabs ── */}
      <div className="flex border-b border-border/60 gap-2 overflow-x-auto scrollbar-none">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 cursor-pointer flex items-center gap-2 outline-none',
              activeTab === key
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'overview' && (
        <OverviewTab
          kpis={kpis}
          rankings={rankings}
          timeRange={timeRange}
          productMap={productMap}
          plantMap={plantMap}
        />
      )}
      {activeTab === 'alerts' && (
        <AlertsTab alerts={alerts} productMap={productMap} plantMap={plantMap} />
      )}

      {/* ── Forecast link ── */}
      <Link
        href="/dashboard/trend-forecast?scope=inventory"
        className="group flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-chart-5/5 p-5 hover:border-primary/40 hover:from-primary/10 hover:to-chart-5/10 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Dự báo xu hướng tồn kho</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Xem dự báo EMA &amp; Hồi quy tuyến tính chi tiết tại trang Dự báo xu hướng →
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
      </Link>
    </div>
  );
}
