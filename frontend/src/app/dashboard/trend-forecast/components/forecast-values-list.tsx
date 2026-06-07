'use client';

import { Calendar } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IForecastDatasetResult } from '@/lib/services/forecast.service';

interface ForecastValueItemProps {
  period: string;
  value: number;
  periodLabel?: string;
}

function ForecastValueItem({ period, value, periodLabel }: ForecastValueItemProps) {
  return (
    <div className="p-3 bg-muted/20 border border-border/50 rounded-xl flex justify-between items-center hover:bg-muted/40 transition-all">
      <span className="text-xs font-medium text-muted-foreground">
        {periodLabel ?? 'Chu kỳ'}: <span className="font-bold text-foreground">{period}</span>
      </span>
      <span className="text-xs font-bold text-primary">
        Dự báo: {Math.round(value).toLocaleString()} sp
      </span>
    </div>
  );
}

interface ForecastValuesListProps {
  sales: IForecastDatasetResult | null;
  inventory: IForecastDatasetResult | null;
}

export function ForecastValuesList({ sales, inventory }: ForecastValuesListProps) {
  const hasSales = sales?.linearRegression?.forecast && sales.linearRegression.forecast.length > 0;
  const hasInventory = inventory?.linearRegression?.forecast && inventory.linearRegression.forecast.length > 0;

  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Số liệu dự đoán tương lai
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {hasSales && (
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Doanh số dự báo hàng kỳ:
            </div>
            {sales!.linearRegression.forecast.map((pt, idx) => {
              return (
                <ForecastValueItem
                  key={idx}
                  period={pt.period}
                  value={pt.value}
                  periodLabel="Chu kỳ"
                />
              );
            })}
          </div>
        )}

        {hasInventory && (
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Tồn kho dự báo hàng ngày:
            </div>
            {inventory!.linearRegression.forecast.map((pt, idx) => {
              return (
                <ForecastValueItem
                  key={idx}
                  period={pt.period}
                  value={pt.value}
                  periodLabel="Ngày dự đoán"
                />
              );
            })}
          </div>
        )}

        {!hasSales && !hasInventory && (
          <div className="text-xs text-muted-foreground text-center py-6">
            Không có điểm dữ liệu dự báo tương lai nào được tính toán.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
