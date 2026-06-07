/**
 * Shared chart styling constants & utilities
 * Dùng chung cho toàn bộ biểu đồ trong dự án
 */

export const CHART_COLORS = {
  primary: 'var(--primary)',
  destructive: 'var(--destructive)',
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
  border: 'var(--border)',
  mutedForeground: 'var(--muted-foreground)',
} as const;

export const CHART_RGBA = {
  primary: 'rgba(var(--primary-rgb),',
  chart1: 'rgba(var(--chart-1-rgb),',
  chart2: 'rgba(var(--chart-2-rgb),',
  chart3: 'rgba(var(--chart-3-rgb),',
  chart4: 'rgba(var(--chart-4-rgb),',
  border: 'rgba(var(--border-rgb),',
} as const;

export const CURSOR_STYLE = {
  stroke: 'rgba(var(--border-rgb), 0.5)',
  strokeWidth: 1,
  strokeDasharray: '4 4',
} as const;

export const GRADIENT_PRESETS = {
  soft: { offset5: 0.3, offset95: 0 },
  medium: { offset5: 0.4, offset95: 0 },
  strong: { offset5: 0.5, offset95: 0.05 },
} as const;

export const BAR_RADIUS = {
  vertical: [0, 4, 4, 0] as [number, number, number, number],
  verticalLarge: [0, 6, 6, 0] as [number, number, number, number],
  horizontal: [4, 4, 0, 0] as [number, number, number, number],
  horizontalLarge: [6, 6, 0, 0] as [number, number, number, number],
} as const;

export const BAR_SIZE = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const CHART_DEFAULTS = {
  margin: { top: 8, right: 12, left: 0, bottom: 8 },
  barChartMargin: { top: 8, right: 12, left: -16, bottom: 8 },
  barChartMarginVertical: { top: 8, right: 16, left: 16, bottom: 8 },
  pieInnerRadius: 45,
  pieOuterRadius: 70,
  pieInnerRadiusLarge: 75,
  pieOuterRadiusLarge: 110,
  piePaddingAngle: 3,
  piePaddingAngleLarge: 4,
  activeDot: { r: 5, strokeWidth: 0 },
} as const;

export const TICK_MARGIN = 8;
export const MIN_TICK_GAP = 32;
export const AXIS_TICK_CLASS = 'text-[10px] fill-muted-foreground';
export const GRID_CLASS = 'stroke-border/40';
export const GRID_DASH = '3 3';

/**
 * Channel color palette (categorical)
 * Centralized để tránh duplicate giữa các file
 */
export const CHANNEL_COLORS: Record<string, string> = {
  Online: 'var(--chart-1)',
  'Bán lẻ': 'hsl(346.8, 77.2%, 49.8%)',
  'Phát sinh': 'hsl(173.4, 80.4%, 40%)',
  'Bán sỉ': 'var(--chart-4)',
  'Siêu thị': 'hsl(47.9, 95.8%, 53.1%)',
  'Hợp đồng': 'hsl(25, 95%, 53%)',
  'Chi nhánh': 'hsl(142.1, 76.2%, 36.3%)',
  'Đổi trả / Hoàn hàng': 'hsl(0, 84.2%, 60.2%)',
};

export function getChannelColor(name: string): string {
  return CHANNEL_COLORS[name] || CHART_COLORS.primary;
}

/**
 * Plant categorical palette (10 distinct colors for top-N rankings)
 */
export const PLANT_COLORS = [
  'var(--chart-4)',
  'hsl(199, 89%, 48%)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--destructive)',
  'var(--chart-4)',
  'var(--chart-5)',
  'hsl(173, 80%, 40%)',
  'hsl(25, 95%, 53%)',
  'hsl(83, 80%, 45%)',
];

/**
 * Gender color palette (categorical)
 */
export const GENDER_COLORS = {
  MEN: 'var(--chart-1)',
  WOM: 'hsl(346.8, 77.2%, 49.8%)',
  BOY: 'var(--chart-2)',
  GIR: 'var(--chart-4)',
} as const;

/**
 * Region color palette (categorical)
 */
export const REGION_COLORS = {
  North: 'var(--primary)',
  Central: 'var(--chart-4)',
  South: 'var(--chart-5)',
} as const;

/**
 * Account status color palette (semantic)
 */
export const ACCOUNT_STATUS_COLORS = {
  new: 'var(--primary)',
  inactive: 'var(--destructive)',
  noLogin: 'var(--chart-3)',
} as const;

/**
 * Account distribution color palette (categorical)
 */
export const DISTRIBUTION_COLORS = {
  ADMIN: '#60a5fa',
  STAFF: '#34d399',
  ACTIVE: 'var(--chart-2)',
  INACTIVE: 'var(--muted-foreground)',
  LOCKED: 'hsl(351, 89%, 60%)',
} as const;
