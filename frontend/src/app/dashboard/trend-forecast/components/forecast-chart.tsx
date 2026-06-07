'use client';

import * as React from 'react';
import { useId, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ChartCard, ChartEmpty } from '@/components/charts/chart-card';
import { cn } from '@/lib/utils';
import {
  AXIS_TICK_CLASS,
  CURSOR_STYLE,
  GRID_CLASS,
  GRID_DASH,
  TICK_MARGIN,
} from '@/lib/chart-constants';

interface ChartDataPoint {
  period: string;
  actual: number | null;
  ema: number | null;
  linear: number | null;
  type: 'actual' | 'forecast';
}

interface ForecastChartProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: ChartDataPoint[];
  forecastStartIndex: number;
  actualColor: string;
  actualLabel: string;
  unit?: string;
}

export function ForecastChart({
  title,
  description,
  icon,
  data,
  forecastStartIndex,
  actualColor,
  actualLabel,
  unit = 'chiếc',
}: ForecastChartProps) {
  const reactId = useId();
  const gradId = `fc-grad-${reactId.replace(/:/g, '')}`;

  // Identify forecast range for shading
  const forecastPoints = data.filter((d) => d.type === 'forecast');
  const firstForecastPeriod = forecastPoints[0]?.period;
  const lastForecastPeriod = forecastPoints[forecastPoints.length - 1]?.period;

  return (
    <ChartCard
      title={title}
      description={description}
      icon={icon}
      height="lg"
      isEmpty={data.length === 0}
      emptyMessage="Không có dữ liệu dự báo"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={actualColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={actualColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid vertical={false} strokeDasharray={GRID_DASH} className={GRID_CLASS} />
          
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={TICK_MARGIN}
            className={AXIS_TICK_CLASS}
          />
          
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={TICK_MARGIN}
            className={AXIS_TICK_CLASS}
          />
          
          <Tooltip
            cursor={CURSOR_STYLE}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const isForecast = payload[0].payload.type === 'forecast';
                return (
                  <div className="rounded-xl bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 space-y-1.5 border border-border">
                    <p className="font-bold flex items-center gap-1.5 border-b border-border/40 pb-1">
                      {label}
                      {isForecast ? (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/20"
                        >
                          Dự báo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          Thực tế
                        </Badge>
                      )}
                    </p>
                    <div className="space-y-1">
                      {payload.map((item, idx) => {
                        if (item.value == null) return null;
                        
                        const name =
                          item.name === 'actual'
                            ? `${actualLabel}: `
                            : 'Dự báo xu hướng: ';
                              
                        return (
                          <p
                            key={idx}
                            style={{ color: item.color }}
                            className="font-medium text-[11px] flex justify-between gap-4"
                          >
                            <span>{name}</span>
                            <span className="font-bold">
                              {Math.round(Number(item.value)).toLocaleString()} {unit}
                            </span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Legend
            verticalAlign="top"
            height={32}
            iconSize={8}
            wrapperStyle={{ fontSize: '11px' }}
          />

          {/* Highlight forecast zone background */}
          {firstForecastPeriod && lastForecastPeriod && (
            <ReferenceArea
              x1={firstForecastPeriod}
              x2={lastForecastPeriod}
              fill="var(--primary)"
              fillOpacity={0.03}
              label={{
                value: 'VÙNG DỰ BÁO XU HƯỚNG',
                position: 'insideTop',
                fill: 'var(--primary)',
                fontSize: 9,
                fontWeight: 700,
                opacity: 0.5,
                dy: 6,
              }}
            />
          )}

          {forecastStartIndex !== -1 && data[forecastStartIndex] && (
            <ReferenceLine
              x={data[forecastStartIndex].period}
              stroke="var(--destructive)"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: 'Mốc dự báo',
                position: 'top',
                fill: 'var(--destructive)',
                fontSize: 10,
                fontWeight: 'bold',
                dy: -4,
              }}
            />
          )}

          {/* Actual line */}
          <Area
            name="actual"
            type="monotone"
            dataKey="actual"
            stroke={actualColor}
            fill={`url(#${gradId})`}
            fillOpacity={1}
            strokeWidth={3}
            dot={false}
          />
          
          {/* Linear regression line */}
          <Area
            name="linear"
            type="monotone"
            dataKey="linear"
            stroke="var(--chart-1)"
            fill="none"
            strokeDasharray="4 2"
            strokeWidth={2.5}
            dot={{ r: 2, strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
