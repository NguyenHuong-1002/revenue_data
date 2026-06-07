'use client';

import { Brain } from 'lucide-react';
import * as React from 'react';

export function TrendForecastHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary animate-pulse" />
          Dự báo xu hướng thông minh
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ứng dụng thuật toán Exponential Smoothing (EMA) và Hồi quy tuyến tính (Linear Regression)
          dự đoán doanh số &amp; tồn kho
        </p>
      </div>
    </div>
  );
}
