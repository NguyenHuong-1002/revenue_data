'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ShoppingBag, RefreshCw, Activity, PieChartIcon, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Services
import { saleReportService } from '@/lib/services/sale-report.service';
import { inventoryReportService } from '@/lib/services/inventory-report.service';
import { productService } from '@/lib/services/product.service';
import { branchService } from '@/lib/services/branch.service';
import { plantService } from '@/lib/services/plant.service';

// Tabs Components
import { DashboardSkeleton } from './components/dashboard-skeleton';
import { OverviewTab } from './components/overview-tab';
import { AnalyticsTab } from './components/analytics-tab';
import { OperationsTab } from './components/operations-tab';

// Time range
type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y';
const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '7d', label: '7 ngày' },
  { key: '1m', label: '1 tháng' },
  { key: '3m', label: '3 tháng' },
  { key: '6m', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
];
function getDateRange(range: TimeRange) {
  const now = new Date();
  const toDate = now.toISOString().split('T')[0];
  const from = new Date(now);
  if (range === '7d') from.setDate(now.getDate() - 7);
  else if (range === '1m') from.setMonth(now.getMonth() - 1);
  else if (range === '3m') from.setMonth(now.getMonth() - 3);
  else if (range === '6m') from.setMonth(now.getMonth() - 6);
  else if (range === '1y') from.setFullYear(now.getFullYear() - 1);
  return { fromDate: from.toISOString().split('T')[0], toDate };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'operations'>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  // Raw data from APIs
  const [salesStats, setSalesStats] = useState<{
    distribution_channel: { name: string; count: number }[];
    monthly_sales: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  }>({
    distribution_channel: [],
    monthly_sales: [],
    top_branches: [],
  });

  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  // Maps for mapping UUIDs to friendly names
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [branchMap, setBranchMap] = useState<Record<string, string>>({});
  const [plantMap, setPlantMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async (range: TimeRange, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { fromDate, toDate } = getDateRange(range);

      const [statsRes, recentSalesRes, alertsRes, productsRes, branchesRes, plantsRes] =
        await Promise.all([
          saleReportService.getStats(range).catch(() => ({
            data: { distribution_channel: [], monthly_sales: [], top_branches: [] },
          })),
          saleReportService
            .list({ limit: 8, fromMonth: fromDate, toMonth: toDate })
            .catch(() => ({ data: { data: [] } })),
          inventoryReportService
            .getAlerts(50, 10000, { fromDate, toDate })
            .catch(() => ({ data: { lowStock: [], totalAlerts: 0 } })),
          productService.list({ limit: 200 }).catch(() => ({ data: { data: [] } })),
          branchService.list({ limit: 100 }).catch(() => ({ data: { data: [] } })),
          plantService.list({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        ]);

      // Process product map
      const prodMap: Record<string, string> = {};
      if (productsRes.data?.data) {
        productsRes.data.data.forEach((p: any) => {
          prodMap[p.product_id] = `${p.color} - ${p.gender} - Size ${p.size}`;
        });
      }
      setProductMap(prodMap);

      // Process branch map
      const brMap: Record<string, string> = {};
      if (branchesRes.data?.data) {
        branchesRes.data.data.forEach((b: any) => {
          brMap[b.store_id] = b.name;
        });
      }
      setBranchMap(brMap);

      // Process plant map
      const plMap: Record<string, string> = {};
      if (plantsRes.data?.data) {
        plantsRes.data.data.forEach((p: any) => {
          plMap[p.plant_id] = p.name_plant;
        });
      }
      setPlantMap(plMap);

      setSalesStats(statsRes.data);
      setRecentSales(recentSalesRes.data?.data || []);
      setLowStockAlerts((alertsRes.data?.lowStock || []).slice(0, 8));

      if (isRefresh) {
        toast.success('Dữ liệu hệ thống đã được đồng bộ mới nhất.');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin dashboard:', error);
      toast.error('Không thể đồng bộ dữ liệu hệ thống.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(timeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData, timeRange]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ef4444'];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* ── Bảng điều khiển Welcome Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl"
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Hệ thống Điều hành & Thống kê
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <Activity className="h-2.5 w-2.5 animate-pulse text-indigo-500" /> Hệ thống Live
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Giám sát doanh số, phân tích doanh thu khu vực, và theo dõi sát sao mức độ tồn kho
                tại các nhà máy.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(timeRange, true)}
            disabled={refreshing}
            className="h-9 gap-2 rounded-xl border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* ── BỘ LỌC THỜI GIAN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Khoảng thời gian
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground/60">·</span>
          <span className="hidden sm:inline text-xs font-mono text-muted-foreground/70">
            {getDateRange(timeRange).fromDate} → {getDateRange(timeRange).toDate}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/40 p-1">
          {TIME_RANGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
                timeRange === key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── THANH CHUYỂN TAB TRỰC QUAN (Declutter Switcher) ── */}
      <div className="flex border-b border-border/60 pb-px gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 rounded-t-lg cursor-pointer flex items-center gap-2 outline-none',
            activeTab === 'overview'
              ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Activity className="h-4 w-4" />
          <span>Tổng quan & Thao tác</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 rounded-t-lg cursor-pointer flex items-center gap-2 outline-none',
            activeTab === 'analytics'
              ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <PieChartIcon className="h-4 w-4" />
          <span>Xu hướng & Biểu đồ</span>
        </button>

        <button
          onClick={() => setActiveTab('operations')}
          className={cn(
            'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 rounded-t-lg cursor-pointer flex items-center gap-2 outline-none',
            activeTab === 'operations'
              ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Giao dịch & Tồn kho</span>
        </button>
      </div>

      {/* ── NỘI DUNG TỪNG TAB ── */}
      <div className="flex flex-col gap-6">
        {activeTab === 'overview' && (
          <OverviewTab
            recentSales={recentSales}
            lowStockAlerts={lowStockAlerts}
            productMap={productMap}
            branchMap={branchMap}
            plantMap={plantMap}
            setActiveTab={setActiveTab}
            timeRange={timeRange}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab salesStats={salesStats} branchMap={branchMap} colors={COLORS} />
        )}

        {activeTab === 'operations' && (
          <OperationsTab
            recentSales={recentSales}
            lowStockAlerts={lowStockAlerts}
            productMap={productMap}
            branchMap={branchMap}
            plantMap={plantMap}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
}
