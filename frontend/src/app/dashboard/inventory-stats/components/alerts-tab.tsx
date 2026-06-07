'use client';

import { AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { Alerts } from './types';
import { AlertTable, EmptyState } from './shared-ui';

interface Props {
  alerts: Alerts | null;
  productMap: Record<string, string>;
  plantMap: Record<string, string>;
}

export function AlertsTab({ alerts, productMap, plantMap }: Props) {
  if (!alerts) return <EmptyState message="Không có dữ liệu cảnh báo" />;
  const totalAlerts = alerts.totalAlerts;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tồn kho thấp */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-500/5 p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Tồn kho thấp
            </p>
          </div>
          <p className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">
            {alerts.lowStock.length}
          </p>
          <p className="text-xs text-muted-foreground">bản ghi dưới ngưỡng an toàn (≤50)</p>
        </div>

        {/* Tồn kho cao */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Tồn kho cao
            </p>
          </div>
          <p className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
            {alerts.highStock.length}
          </p>
          <p className="text-xs text-muted-foreground">bản ghi vượt ngưỡng cảnh báo (≥10,000)</p>
        </div>

        {/* Tổng cảnh báo */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tổng cảnh báo
            </p>
          </div>
          <p className="text-4xl font-extrabold text-foreground">{totalAlerts}</p>
          <p className="text-xs text-muted-foreground">cần kiểm tra và xử lý</p>
        </div>
      </div>

      {totalAlerts === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <Activity className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
            Tồn kho ổn định
          </p>
          <p className="text-sm text-muted-foreground">
            Không có cảnh báo nào trong ngưỡng hiện tại
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {alerts.lowStock.length > 0 && (
            <AlertTable
              title="⚠️ Tồn kho thấp — cần nhập thêm hàng"
              rows={alerts.lowStock}
              badgeColor="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              barColor="bg-rose-400"
              maxVal={Math.max(...alerts.lowStock.map((a) => a.quantity))}
              productMap={productMap}
              plantMap={plantMap}
            />
          )}
          {alerts.highStock.length > 0 && (
            <AlertTable
              title="📦 Tồn kho cao — có thể tối ưu"
              rows={alerts.highStock}
              badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              barColor="bg-amber-400"
              maxVal={Math.max(...alerts.highStock.map((a) => a.quantity))}
              productMap={productMap}
              plantMap={plantMap}
            />
          )}
        </div>
      )}
    </div>
  );
}
