import { inventoryReportService } from '@/lib/services/inventory-report.service';

export type Kpis = Awaited<ReturnType<typeof inventoryReportService.getKpis>>['data'];
export type Rankings = Awaited<ReturnType<typeof inventoryReportService.getRankings>>['data'];
export type Alerts = Awaited<ReturnType<typeof inventoryReportService.getAlerts>>['data'];

export type PageTab = 'overview' | 'alerts';
export type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y';

export const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '7d', label: '7 ngày' },
  { key: '1m', label: '1 tháng' },
  { key: '3m', label: '3 tháng' },
  { key: '6m', label: '6 tháng' },
  { key: '1y', label: '1 năm' },
];

export const PLANT_COLORS = [
  '#6366F1',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#84CC16',
];

export const GROWTH_LABEL: Record<TimeRange, string> = {
  '7d': '7 ngày qua',
  '1m': 'tháng trước',
  '3m': '3 tháng trước',
  '6m': '6 tháng trước',
  '1y': 'năm trước',
};

export function getDateRange(range: TimeRange): { fromDate: string; toDate: string } {
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

export function fmtNum(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function fmtMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `T${parseInt(m)}/${y.slice(2)}`;
}
