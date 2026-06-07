'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  FileChartColumn,
  TrendingUp,
  TrendingDown,
  Download,
  Loader2,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Settings2,
  BarChart3,
  RefreshCw,
  DollarSign,
  Package,
  Building2,
  ArrowRight,
  Info,
  CheckCircle2,
  ChevronRight,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reportService } from '@/lib/services/report.service';
import { saleReportService } from '@/lib/services/sale-report.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getProductDisplayName } from '../utils';
import { Skeleton } from '@/components/ui/skeleton';

type ExportType = 'revenue-pdf' | 'revenue-excel' | 'growth-pdf' | 'growth-excel';

interface PreviewData {
  totalRevenue: number;
  growthRate: number;
  topProductByRevenue: {
    id: string;
    name: string;
    revenue: number;
    quantity?: number;
    detail_product_group: string;
    gender: string;
    color: string;
    size: number;
  };
  topProductByQuantity: {
    id: string;
    name: string;
    quantity: number;
    revenue?: number;
    detail_product_group: string;
    gender: string;
    color: string;
    size: number;
  };
  topBranches: { name: string; count: number }[];
  topChannels: { name: string; count: number }[];
  monthlySales: { name: string; count: number }[];
}

/* ─── helpers ─── */
function fmtVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}
function fmtNum(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}
function parseMonthLabel(ym: string) {
  const [y, m] = ym.split('-');
  return `Tháng ${parseInt(m, 10)}/${y}`;
}

export function ExportReports() {
  const [fromMonth, setFromMonth] = useState('2022-01');
  const [toMonth, setToMonth] = useState('2022-06');
  const [topN, setTopN] = useState<number>(10);

  const [loadingStates, setLoadingStates] = useState<Record<ExportType, boolean>>({
    'revenue-pdf': false,
    'revenue-excel': false,
    'growth-pdf': false,
    'growth-excel': false,
  });

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  /* ── Load preview data ── */
  const loadPreview = useCallback(async () => {
    if (!fromMonth || !toMonth) {
      toast.error('Vui lòng chọn đầy đủ từ tháng và đến tháng.');
      return;
    }
    if (new Date(fromMonth) > new Date(toMonth)) {
      toast.error('Tháng bắt đầu không được lớn hơn tháng kết thúc.');
      return;
    }
    setLoadingPreview(true);
    try {
      const [kpisRes, statsRes] = await Promise.all([
        saleReportService.getRevenueStats(),
        saleReportService.getStats(),
      ]);
      const kpis = kpisRes.data;
      const stats = statsRes.data;
      setPreview({
        totalRevenue: kpis.totalRevenue,
        growthRate: kpis.growthRate,
        topProductByRevenue: kpis.topProductByRevenue as any,
        topProductByQuantity: kpis.topProductByQuantity as any,
        topBranches: stats.top_branches.slice(0, 5),
        topChannels: stats.distribution_channel.slice(0, 4),
        monthlySales: stats.monthly_sales.slice(-6),
      });
    } catch {
      toast.error('Không thể tải dữ liệu xem trước.');
    } finally {
      setLoadingPreview(false);
    }
  }, [fromMonth, toMonth]);

  /* ── Export ── */
  const handleExport = async (type: ExportType) => {
    if (!fromMonth || !toMonth) {
      toast.error('Vui lòng chọn đầy đủ thời gian từ tháng và đến tháng.');
      return;
    }
    if (new Date(fromMonth) > new Date(toMonth)) {
      toast.error('Tháng bắt đầu không được lớn hơn tháng kết thúc.');
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [type]: true }));
    const params = { fromMonth, toMonth, topN: Number(topN) };

    let apiCall: () => Promise<any>;
    let filename = '';
    switch (type) {
      case 'revenue-pdf':
        apiCall = () => reportService.exportRevenuePdf(params);
        filename = `bao-cao-doanh-thu_${fromMonth}_den_${toMonth}.pdf`;
        break;
      case 'revenue-excel':
        apiCall = () => reportService.exportRevenueExcel(params);
        filename = `bao-cao-doanh-thu_${fromMonth}_den_${toMonth}.xlsx`;
        break;
      case 'growth-pdf':
        apiCall = () => reportService.exportGrowthPdf(params);
        filename = `bao-cao-tang-truong_${fromMonth}_den_${toMonth}.pdf`;
        break;
      case 'growth-excel':
        apiCall = () => reportService.exportGrowthExcel(params);
        filename = `bao-cao-tang-truong_${fromMonth}_den_${toMonth}.xlsx`;
        break;
    }

    try {
      const response = await apiCall();
      const blob = new Blob([response.data], { type: response.data.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Xuất báo cáo thành công: ${filename}`);
    } catch (err: any) {
      let msg = 'Lỗi khi xuất báo cáo. Vui lòng kiểm tra quyền hạn hoặc cấu hình hệ thống.';
      if (err.response?.data instanceof Blob) {
        try {
          const t = await err.response.data.text();
          const o = JSON.parse(t);
          if (o.message) msg = o.message;
        } catch {
          /* keep generic */
        }
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      toast.error(msg);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const isGrowthPositive = (preview?.growthRate ?? 0) > 0;
  const isGrowthNeutral = (preview?.growthRate ?? 0) === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ══════════ STEP 1 — CẤU HÌNH ══════════ */}
      <Section
        step="1"
        stepColor="bg-violet-600"
        stepShadow="shadow-violet-500/30"
        icon={Settings2}
        title="Cấu hình tham số báo cáo"
        subtitle="Xác định khoảng thời gian và số lượng hạng mục cần thống kê trong báo cáo"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {/* Từ tháng */}
          <FieldWrapper
            id="export-fromMonth"
            label="Từ tháng"
            hint="Tháng bắt đầu của kỳ báo cáo"
            icon={Calendar}
            iconColor="text-blue-500"
          >
            <Input
              id="export-fromMonth"
              type="month"
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="bg-background/60 border-border/60 text-foreground focus-visible:ring-blue-500/30 transition-colors"
            />
          </FieldWrapper>

          {/* Đến tháng */}
          <FieldWrapper
            id="export-toMonth"
            label="Đến tháng"
            hint="Tháng kết thúc của kỳ báo cáo"
            icon={Calendar}
            iconColor="text-blue-500"
          >
            <Input
              id="export-toMonth"
              type="month"
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="bg-background/60 border-border/60 text-foreground focus-visible:ring-blue-500/30 transition-colors"
            />
          </FieldWrapper>

          {/* Top N */}
          <FieldWrapper
            id="export-topN"
            label="Số lượng xếp hạng (Top N)"
            hint={`Hiển thị top ${topN} sản phẩm & chi nhánh trong báo cáo`}
            icon={BarChart3}
            iconColor="text-violet-500"
          >
            <Input
              id="export-topN"
              type="number"
              min={1}
              max={50}
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="bg-background/60 border-border/60 text-foreground focus-visible:ring-violet-500/30 transition-colors"
            />
          </FieldWrapper>
        </div>

        {/* Phạm vi thời gian */}
        {fromMonth && toMonth && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-2.5">
            <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Báo cáo sẽ bao gồm dữ liệu từ&nbsp;
              <strong>{parseMonthLabel(fromMonth)}</strong>
              &nbsp;đến&nbsp;
              <strong>{parseMonthLabel(toMonth)}</strong>
              &nbsp;— Top <strong>{topN}</strong> sản phẩm & chi nhánh.
            </p>
          </div>
        )}

        {/* Nút tải xem trước */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPreview}
            disabled={loadingPreview}
            className={cn(
              'h-9 gap-2 rounded-xl border-violet-500/40 text-violet-600 dark:text-violet-400',
              'hover:bg-violet-500/8 hover:border-violet-500/60 cursor-pointer transition-all duration-200',
              loadingPreview && 'opacity-70'
            )}
          >
            {loadingPreview ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {preview ? 'Làm mới xem trước' : 'Tải xem trước dữ liệu'}
          </Button>
        </div>
      </Section>

      {/* ══════════ STEP 2 — XEM TRƯỚC DỮ LIỆU ══════════ */}
      <Section
        step="2"
        stepColor="bg-emerald-600"
        stepShadow="shadow-emerald-500/30"
        icon={BarChart3}
        title="Xem trước dữ liệu thống kê"
        subtitle="Tổng quan các chỉ số quan trọng sẽ xuất hiện trong báo cáo"
      >
        {loadingPreview ? (
          <div className="flex flex-col gap-5">
            {/* KPI row skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/50 bg-card shadow-xs flex flex-col gap-2"
                >
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-6 w-28 rounded-md" />
                </div>
              ))}
            </div>
            {/* Table preview skeleton */}
            <div className="p-5 border border-border/50 bg-card rounded-xl shadow-xs space-y-3">
              <Skeleton className="h-4 w-32 rounded-md" />
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <Skeleton className="h-4 w-48 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : preview ? (
          <div className="flex flex-col gap-5">
            {/* ── KPI row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniKpi
                label="Tổng doanh thu"
                value={fmtVND(preview.totalRevenue)}
                icon={DollarSign}
                colorClass="bg-emerald-600"
                shadowClass="shadow-emerald-500/20"
                accent="bg-emerald-500/8 border-emerald-500/20"
              />
              <MiniKpi
                label="Tăng trưởng kỳ gần nhất"
                value={
                  isGrowthNeutral
                    ? '—  Tháng đầu'
                    : `${isGrowthPositive ? '+' : ''}${preview.growthRate}%`
                }
                icon={isGrowthPositive ? TrendingUp : isGrowthNeutral ? Minus : TrendingDown}
                colorClass={
                  isGrowthNeutral
                    ? 'bg-slate-500'
                    : isGrowthPositive
                      ? 'bg-blue-600'
                      : 'bg-rose-600'
                }
                shadowClass={isGrowthPositive ? 'shadow-blue-500/20' : 'shadow-rose-500/20'}
                accent={
                  isGrowthNeutral
                    ? 'bg-muted/40 border-border/40'
                    : isGrowthPositive
                      ? 'bg-blue-500/8 border-blue-500/20'
                      : 'bg-rose-500/8 border-rose-500/20'
                }
                valueClass={
                  isGrowthPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isGrowthNeutral
                      ? 'text-muted-foreground'
                      : 'text-rose-600 dark:text-rose-400'
                }
              />
              <MiniKpi
                label="Sản phẩm doanh thu cao nhất"
                value={getProductDisplayName(preview.topProductByRevenue)}
                subValue={fmtVND(preview.topProductByRevenue.revenue)}
                icon={DollarSign}
                colorClass="bg-amber-600"
                shadowClass="shadow-amber-500/20"
                accent="bg-amber-500/8 border-amber-500/20"
                small
              />
              <MiniKpi
                label="Sản phẩm bán chạy nhất"
                value={getProductDisplayName(preview.topProductByQuantity)}
                subValue={`${fmtNum(preview.topProductByQuantity.quantity)} sản phẩm`}
                icon={Package}
                colorClass="bg-violet-600"
                shadowClass="shadow-violet-500/20"
                accent="bg-violet-500/8 border-violet-500/20"
                small
              />
            </div>

            {/* ── Bảng xếp hạng ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top chi nhánh */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-foreground">
                    Top chi nhánh bán chạy
                  </span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {preview.topBranches.length > 0 ? (
                    preview.topBranches.map((b, i) => {
                      const max = preview.topBranches[0].count || 1;
                      return (
                        <RankRow
                          key={b.name}
                          rank={i + 1}
                          label={`Chi nhánh ${b.name}`}
                          value={`${fmtNum(b.count)} sp`}
                          pct={(b.count / max) * 100}
                          barColor="bg-blue-500"
                        />
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      Không có dữ liệu
                    </p>
                  )}
                </div>
              </div>

              {/* Kênh phân phối */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                  <BarChart3 className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs font-semibold text-foreground">
                    Kênh phân phối chính
                  </span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {preview.topChannels.length > 0 ? (
                    preview.topChannels.map((c, i) => {
                      const max = preview.topChannels[0].count || 1;
                      return (
                        <RankRow
                          key={c.name}
                          rank={i + 1}
                          label={c.name}
                          value={`${fmtNum(c.count)} sp`}
                          pct={(c.count / max) * 100}
                          barColor="bg-violet-500"
                        />
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      Không có dữ liệu
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Xu hướng tháng ── */}
            {preview.monthlySales.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-foreground">
                    Xu hướng doanh số theo tháng (6 kỳ gần nhất)
                  </span>
                </div>
                <div className="px-4 py-4">
                  <MiniSparkBars data={preview.monthlySales} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-3 border border-dashed border-border/60 rounded-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
              <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Chưa có dữ liệu xem trước</p>
            <p className="text-xs text-muted-foreground/70">
              Nhấn <strong>"Tải xem trước dữ liệu"</strong> ở trên để kiểm tra số liệu trước khi
              xuất
            </p>
          </div>
        )}
      </Section>

      {/* ══════════ STEP 3 — CHỌN LOẠI BÁO CÁO & XUẤT ══════════ */}
      <Section
        step="3"
        stepColor="bg-blue-600"
        stepShadow="shadow-blue-500/30"
        icon={Download}
        title="Chọn loại báo cáo và xuất file"
        subtitle="Mỗi báo cáo có thể xuất ra định dạng PDF (in ấn, trình bày) hoặc Excel (phân tích, chỉnh sửa)"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {/* ── Báo cáo Doanh thu ── */}
          <ReportCard
            icon={FileChartColumn}
            iconGradient="bg-blue-600"
            iconShadow="shadow-blue-500/30"
            accentBar="bg-blue-600"
            glowHex="rgba(var(--primary-rgb), 0.12)"
            title="Báo cáo Doanh thu Hệ thống"
            contents={[
              'Tổng doanh thu toàn hệ thống theo kỳ',
              'Xếp hạng sản phẩm theo doanh thu & số lượng bán',
              `Top ${topN} sản phẩm có đóng góp cao nhất`,
              `Top ${topN} chi nhánh phân phối lớn nhất`,
              'Phân tích theo kênh phân phối',
            ]}
            onExportPdf={() => handleExport('revenue-pdf')}
            onExportExcel={() => handleExport('revenue-excel')}
            loadingPdf={loadingStates['revenue-pdf']}
            loadingExcel={loadingStates['revenue-excel']}
            disabled={isAnyLoading}
          />

          {/* ── Báo cáo Tăng trưởng ── */}
          <ReportCard
            icon={TrendingUp}
            iconGradient="bg-violet-600"
            iconShadow="shadow-violet-500/30"
            accentBar="bg-violet-600"
            glowHex="rgba(var(--chart-4-rgb), 0.12)"
            title="Báo cáo Tăng trưởng & Dự báo"
            badge={
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-500">
                <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                AI / ML
              </span>
            }
            contents={[
              'Tỷ lệ tăng trưởng doanh số hàng tháng',
              'So sánh hiệu suất kỳ hiện tại vs kỳ trước',
              'Dự báo xu hướng doanh thu kỳ tới (EMA & Hồi quy tuyến tính)',
              `Sản phẩm tăng trưởng mạnh nhất (Top ${topN})`,
              'Nhận định & đề xuất chiến lược kinh doanh',
            ]}
            onExportPdf={() => handleExport('growth-pdf')}
            onExportExcel={() => handleExport('growth-excel')}
            loadingPdf={loadingStates['growth-pdf']}
            loadingExcel={loadingStates['growth-excel']}
            disabled={isAnyLoading}
          />
        </div>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════ */

/* ── Section wrapper ── */
function Section({
  step,
  stepColor,
  stepShadow,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  step: string;
  stepColor: string;
  stepShadow: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
      {/* Top accent */}
      <div className="absolute top-0 left-0 h-0.5 w-full bg-violet-600/50" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className={cn(
              'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg',
              stepColor,
              stepShadow
            )}
          >
            <Icon className="h-5 w-5" />
            {/* Step badge */}
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border text-[9px] font-bold text-foreground">
              {step}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ── Field wrapper ── */
function FieldWrapper({
  id,
  label,
  hint,
  icon: Icon,
  iconColor,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
      >
        <Icon className={cn('h-3.5 w-3.5', iconColor)} />
        {label}
      </Label>
      {children}
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

/* ── Mini KPI card ── */
function MiniKpi({
  label,
  value,
  subValue,
  icon: Icon,
  colorClass,
  shadowClass,
  accent,
  valueClass,
  small,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  colorClass: string;
  shadowClass: string;
  accent: string;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <div className={cn('rounded-xl border p-3.5 space-y-2', accent)}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
          {label}
        </p>
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-md',
            colorClass,
            shadowClass
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div>
        <p
          className={cn(
            'font-bold leading-snug text-foreground',
            small ? 'text-xs line-clamp-2' : 'text-base',
            valueClass
          )}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
}

/* ── Rank row ── */
function RankRow({
  rank,
  label,
  value,
  pct,
  barColor,
}: {
  rank: number;
  label: string;
  value: string;
  pct: number;
  barColor: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-foreground font-medium">
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
              rank === 1
                ? 'bg-amber-500/20 text-amber-600'
                : rank === 2
                  ? 'bg-slate-400/20 text-slate-500'
                  : rank === 3
                    ? 'bg-orange-400/20 text-orange-600'
                    : 'bg-muted text-muted-foreground'
            )}
          >
            {rank}
          </span>
          <span className="truncate max-w-[140px]">{label}</span>
        </span>
        <span className="text-foreground font-semibold shrink-0 ml-2">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Mini spark bars (monthly sales) ── */
function MiniSparkBars({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((d, i) => {
        const h = Math.max((d.count / max) * 100, 4);
        const isLast = i === data.length - 1;
        return (
          <div key={d.name} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex items-end" style={{ height: '48px' }}>
              <div
                className={cn(
                  'w-full rounded-t-sm transition-all duration-500',
                  isLast ? 'bg-violet-600' : 'bg-blue-500/60'
                )}
                style={{ height: `${h}%` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground truncate w-full text-center">{d.name}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Report card ── */
interface ReportCardProps {
  icon: React.ElementType;
  iconGradient: string;
  iconShadow: string;
  accentBar: string;
  glowHex: string;
  title: string;
  badge?: React.ReactNode;
  contents: string[];
  onExportPdf: () => void;
  onExportExcel: () => void;
  loadingPdf: boolean;
  loadingExcel: boolean;
  disabled: boolean;
}

function ReportCard({
  icon: Icon,
  iconGradient,
  iconShadow,
  accentBar,
  glowHex,
  title,
  badge,
  contents,
  onExportPdf,
  onExportExcel,
  loadingPdf,
  loadingExcel,
  disabled,
}: ReportCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-border">
      {/* Hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: glowHex }}
      />

      {/* Card header */}
      <div className="relative flex items-start gap-4 p-5">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg',
            iconGradient,
            iconShadow
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 flex-wrap">
            {title}
            {badge}
          </h3>
        </div>
      </div>

      {/* Contents list */}
      <div className="relative px-5 pb-4 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Nội dung báo cáo bao gồm
        </p>
        <ul className="space-y-1.5">
          {contents.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Export buttons */}
      <div className="relative mt-auto border-t border-border/40 bg-muted/5 p-4 flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onExportPdf}
          disabled={disabled || loadingPdf}
          className={cn(
            'flex-1 h-9 text-xs font-semibold text-white shadow-sm cursor-pointer transition-all duration-200',
            'bg-red-600 hover:bg-red-700',
            'hover:shadow-rose-500/20',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {loadingPdf ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 shrink-0" />
          ) : (
            <FileText className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          )}
          Xuất PDF
        </Button>
        <Button
          onClick={onExportExcel}
          disabled={disabled || loadingExcel}
          className={cn(
            'flex-1 h-9 text-xs font-semibold text-white shadow-sm cursor-pointer transition-all duration-200',
            'bg-emerald-600 hover:bg-emerald-700',
            'hover:shadow-emerald-500/20',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {loadingExcel ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 shrink-0" />
          ) : (
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          )}
          Xuất Excel
        </Button>
      </div>

      {/* Bottom accent bar */}
      <div className={cn('absolute bottom-0 left-0 h-0.5 w-full', accentBar)} />
    </div>
  );
}
