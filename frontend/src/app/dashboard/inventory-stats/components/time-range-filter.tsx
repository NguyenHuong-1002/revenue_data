'use client';

import { cn } from '@/lib/utils';
import { TimeRange, TIME_RANGES, getDateRange } from './types';

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeRangeFilter({ value, onChange }: Props) {
  const { fromDate, toDate } = getDateRange(value);
  const dateLabel = `${fromDate} → ${toDate}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Khoảng thời gian
        </span>
        <span className="hidden sm:inline text-xs text-muted-foreground/60">·</span>
        <span className="hidden sm:inline text-xs text-muted-foreground/70 font-mono">
          {dateLabel}
        </span>
      </div>
      <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/40 p-1">
        {TIME_RANGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
              value === key
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
