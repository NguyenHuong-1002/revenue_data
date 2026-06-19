'use client';

import { BarChart2, Brain, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { saleReportService } from '@/lib/services/sale-report.service';
import { cn } from '@/lib/utils';
import { BranchBreakdown } from './components/branch-breakdown';
import { ExportReports } from './components/export-reports';
import { ProductRankings } from './components/product-rankings';
import { RevenueCharts } from './components/revenue-charts';
import { RevenueStatsHeader } from './components/revenue-stats-header';
import { RevenueStatsKpis } from './components/revenue-stats-kpis';
import { RevenueStatsSkeleton } from './components/revenue-stats-skeleton';
import { TopProducts } from './components/top-products';
import { RevenueKpis, ChartData, HighlightProducts } from './types';

type RankingTab =
  | 'topRevenue'
  | 'bottomRevenue'
  | 'topQuantity'
  | 'bottomQuantity'
  | 'topGrowth'
  | 'bottomGrowth';

type PageTab = 'stats' | 'export';

export default function RevenueStatsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllBranches, setShowAllBranches] = useState(false);
  const [activeTab, setActiveTab] = useState<RankingTab>('topRevenue');
  const [selectedRange, setSelectedRange] = useState<string>('7days');
  const [pageTab, setPageTab] = useState<PageTab>('stats');

  // Revenue KPIs State
  const [kpis, setKpis] = useState<RevenueKpis>({
    totalRevenue: 0,
    growthRate: 0,
    topProductByRevenue: {
      id: '',
      name: '',
      revenue: 0,
      quantity: 0,
      detail_product_group: '',
      gender: '',
      color: '',
      size: 0,
    },
    topProductByQuantity: {
      id: '',
      name: '',
      revenue: 0,
      quantity: 0,
      detail_product_group: '',
      gender: '',
      color: '',
      size: 0,
    },
  });

  // Chart & Breakdown Data State
  const [charts, setCharts] = useState<ChartData>({
    distribution_channel: [],
    monthly_sales: [],
    top_branches: [],
  });

  // Highlight Products Lists State (Top & Bottom 10 lists)
  const [highlights, setHighlights] = useState<HighlightProducts>({
    topRevenue: [],
    bottomRevenue: [],
    topQuantity: [],
    bottomQuantity: [],
    topGrowth: [],
    bottomGrowth: [],
  });

  const loadData = useCallback(
    async (isRefresh = false, rangeVal = selectedRange) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [kpisRes, chartsRes, highlightsRes] = await Promise.all([
          saleReportService.getRevenueStats(rangeVal),
          saleReportService.getStats(rangeVal),
          saleReportService.getHighlightProductsStats(rangeVal),
        ]);

        setKpis(kpisRes.data);
        setCharts(chartsRes.data);
        setHighlights(highlightsRes.data);
      } catch {
        toast.error('Không thể tải dữ liệu thống kê doanh thu');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedRange]
  );

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData(false, selectedRange);
    });
  }, [loadData, selectedRange]);

  const topBestSellingProducts = useMemo(() => {
    if (!highlights.topQuantity || highlights.topQuantity.length === 0) return [];
    const top5ByQty = highlights.topQuantity.slice(0, 5);
    return [...top5ByQty].sort((a, b) => b.revenue - a.revenue);
  }, [highlights.topQuantity]);

  if (loading) {
    return <RevenueStatsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <RevenueStatsHeader
        refreshing={refreshing}
        onRefresh={() => loadData(true, selectedRange)}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-border/60 gap-2 overflow-x-auto scrollbar-none">
        <TabButton
          active={pageTab === 'stats'}
          onClick={() => setPageTab('stats')}
          icon={BarChart2}
          label="Thống kê"
        />
        <TabButton
          active={pageTab === 'export'}
          onClick={() => setPageTab('export')}
          icon={Download}
          label="Xuất báo cáo"
        />
      </div>

      {/* Tab Content */}
      {pageTab === 'stats' && (
        <>
          {/* KPI Grid */}
          <RevenueStatsKpis kpis={kpis} />

          {/* Charts Grid */}
          <RevenueCharts charts={charts} />

          {/* Product Rankings Section */}
          <ProductRankings
            highlights={highlights}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BranchBreakdown
              branches={charts.top_branches}
              showAllBranches={showAllBranches}
              setShowAllBranches={setShowAllBranches}
            />
            <TopProducts products={topBestSellingProducts} />
          </div>
        </>
      )}

      {pageTab === 'export' && <ExportReports />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tab Button Sub-component
───────────────────────────────────────────── */
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 cursor-pointer flex items-center gap-2 outline-none',
        active
          ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}
