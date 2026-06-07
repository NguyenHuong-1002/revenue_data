import * as React from 'react';
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── HighlightCard ── */
export function HighlightCard({
  title,
  id,
  value,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  id: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm flex items-center gap-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', bg)}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
        <p className="text-sm font-bold text-foreground truncate">{id}</p>
        <p className={cn('text-lg font-bold', color)}>{value}</p>
      </div>
    </div>
  );
}

/* ── RankRow ── */
export function RankRow({
  rank,
  label,
  value,
  pct,
  color,
}: {
  rank: number;
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: color }}
          >
            {rank}
          </span>
          <span className="truncate max-w-[140px]">{label}</span>
        </span>
        <span className="font-semibold text-foreground shrink-0 ml-2">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ── AlertTable ── */
export function AlertTable({
  title,
  rows,
  badgeColor,
  barColor,
  maxVal,
  productMap = {},
  plantMap = {},
}: {
  title: string;
  rows: { product_id: string; plant_id: string; quantity: number }[];
  badgeColor: string;
  barColor: string;
  maxVal: number;
  productMap?: Record<string, string>;
  plantMap?: Record<string, string>;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm flex flex-col gap-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap',
                    badgeColor
                  )}
                  title={row.plant_id}
                >
                  {plantMap[row.plant_id] || row.plant_id}
                </span>
                <span
                  className="truncate text-muted-foreground"
                  title={row.product_id}
                >
                  {productMap[row.product_id] || row.product_id}
                </span>
              </div>
              <span className="font-bold text-foreground shrink-0 ml-2">
                {new Intl.NumberFormat('vi-VN').format(row.quantity)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={cn('h-full rounded-full transition-all duration-500', barColor)}
                style={{ width: `${(row.quantity / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── EmptyState ── */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-border/60">
      <Database className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
