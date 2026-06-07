'use client';

import { LineChart } from 'lucide-react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IForecastDatasetResult } from '@/lib/services/forecast.service';

interface AlgorithmMetricProps {
  label: string;
  value: React.ReactNode;
}

function AlgorithmMetric({ label, value }: AlgorithmMetricProps) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-bold text-foreground text-sm">{value}</p>
    </div>
  );
}

interface ModelMetricsSectionProps {
  label: string;
  dotColor: string;
  textColor: string;
  data: IForecastDatasetResult;
}

function ModelMetricsSection({ label, dotColor, textColor, data }: ModelMetricsSectionProps) {
  return (
    <div className="space-y-3">
      <div className={`font-semibold ${textColor} flex items-center gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {label}
      </div>
      <div className="grid grid-cols-3 gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/40">
        <AlgorithmMetric label="Lượng quan sát" value={`${data.observations} chu kỳ`} />
        <AlgorithmMetric
          label="Độ dốc (Slope)"
          value={Number(data.linearRegression.slope.toFixed(2))}
        />
        <AlgorithmMetric
          label="Mức cơ sở (Intercept)"
          value={Math.round(data.linearRegression.intercept)}
        />
      </div>
    </div>
  );
}

interface ModelMetricsProps {
  sales: IForecastDatasetResult | null;
  inventory: IForecastDatasetResult | null;
}

export function ModelMetrics({ sales, inventory }: ModelMetricsProps) {
  return (
    <Card className="border border-border/80 bg-card/35 backdrop-blur-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <LineChart className="h-4 w-4 text-purple-500" />
          Tham số &amp; Chất lượng mô hình
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 text-xs">
        {sales && (
          <ModelMetricsSection
            label="Thuật toán Doanh số (Sales)"
            dotColor="bg-emerald-500"
            textColor="text-emerald-600 dark:text-emerald-400"
            data={sales}
          />
        )}
        {inventory && (
          <ModelMetricsSection
            label="Thuật toán Tồn kho (Stock)"
            dotColor="bg-blue-500"
            textColor="text-blue-600 dark:text-blue-400"
            data={inventory}
          />
        )}
      </CardContent>
    </Card>
  );
}
