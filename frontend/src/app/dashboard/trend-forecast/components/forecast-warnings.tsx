'use client';

import { Info } from 'lucide-react';
import * as React from 'react';

interface ForecastWarningsProps {
  warnings: string[];
}

export function ForecastWarnings({ warnings }: ForecastWarningsProps) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex gap-2 items-start">
      <Info className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-semibold">Lưu ý phân tích dữ liệu:</span>
        <ul className="list-disc pl-4 space-y-0.5">
          {warnings.map((w, idx) => (
            <li key={idx}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
