'use client';

import { Users, ShieldCheck, Lock } from 'lucide-react';
import * as React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartCard } from '@/components/charts/chart-card';
import { ChartSkeleton } from '@/components/charts/chart-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CHART_DEFAULTS } from '@/lib/chart-constants';
import type { IAccount } from '@/lib/types/account';

interface AccountsDistributionChartsProps {
  accounts: IAccount[];
  isLoading?: boolean;
}

interface RoleDatum {
  name: string;
  value: number;
  color: string;
  bgClass: string;
}

interface StatusDatum {
  name: string;
  value: number;
  color: string;
  bgClass: string;
}

const pieConfig = {
  value: { label: 'Số lượng' },
} satisfies ChartConfig;

const ROLE_PALETTE: RoleDatum[] = [
  { name: 'Quản trị viên (ADMIN)', value: 0, color: '#60a5fa', bgClass: 'bg-[#60a5fa]' },
  { name: 'Nhân viên (STAFF)', value: 0, color: '#34d399', bgClass: 'bg-[#34d399]' },
];

const STATUS_PALETTE: StatusDatum[] = [
  { name: 'Hoạt động (ACTIVE)', value: 0, color: '#10b981', bgClass: 'bg-[#10b981]' },
  { name: 'Tạm ngưng (INACTIVE)', value: 0, color: '#6b7280', bgClass: 'bg-[#6b7280]' },
  { name: 'Bị khóa (LOCKED)', value: 0, color: '#f43f5e', bgClass: 'bg-[#f43f5e]' },
];

type StatusKey = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

const STATUS_VALUE_BY_KEY: Record<
  StatusKey,
  (counts: { activeCount: number; inactiveCount: number; lockedCount: number }) => number
> = {
  ACTIVE: (c) => c.activeCount,
  INACTIVE: (c) => c.inactiveCount,
  LOCKED: (c) => c.lockedCount,
};

function statusKeyOf(name: string): StatusKey {
  if (name.includes('LOCKED')) return 'LOCKED';
  if (name.includes('INACTIVE')) return 'INACTIVE';
  return 'ACTIVE';
}

export function AccountsDistributionCharts({
  accounts,
  isLoading = false,
}: AccountsDistributionChartsProps) {
  const [zoomedChart, setZoomedChart] = React.useState<'role' | 'status' | null>(null);

  const { adminCount, staffCount, activeCount, inactiveCount, lockedCount } = React.useMemo(() => {
    return {
      adminCount: accounts.filter((acc) => acc.role === 'ADMIN').length,
      staffCount: accounts.filter((acc) => acc.role === 'STAFF').length,
      activeCount: accounts.filter((acc) => acc.status_account === 'ACTIVE').length,
      inactiveCount: accounts.filter((acc) => acc.status_account === 'INACTIVE').length,
      lockedCount: accounts.filter((acc) => acc.status_account === 'LOCKED').length,
    };
  }, [accounts]);

  const roleData = React.useMemo(
    () =>
      [
        { ...ROLE_PALETTE[0], value: adminCount },
        { ...ROLE_PALETTE[1], value: staffCount },
      ].filter((item) => item.value > 0),
    [adminCount, staffCount]
  );

  const statusData = React.useMemo(
    () =>
      [
        { ...STATUS_PALETTE[0], value: activeCount },
        { ...STATUS_PALETTE[1], value: inactiveCount },
        { ...STATUS_PALETTE[2], value: lockedCount },
      ].filter((item) => item.value > 0),
    [activeCount, inactiveCount, lockedCount]
  );

  const totalAccounts = accounts.length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/60 shadow-sm rounded-xl p-5 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
            <Skeleton className="size-8 rounded-lg shrink-0" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-20 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
          </div>
          <div className="space-y-2 border-t border-border/40 pt-4">
            <Skeleton className="h-2.5 w-24 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
          </div>
        </div>
        <ChartSkeleton height="md" />
        <ChartSkeleton height="md" />
      </div>
    );
  }

  const renderLegend = (data: { color: string; name: string }[]) => (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2 w-full">
      {data.map((item) => (
        <span
          key={item.name}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground/80"
        >
          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          {item.name}
        </span>
      ))}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-3 duration-300">
        <ChartCard
          title={
            <span className="flex items-center gap-2">
              <span>Tổng quan</span>
              <Badge className="font-semibold text-[10px] py-0 px-2 bg-primary/10 text-primary border-none hover:bg-primary/15">
                {totalAccounts} Thành viên
              </Badge>
            </span>
          }
          description="Phân bổ vai trò & trạng thái hoạt động."
          icon={<Users className="size-4" />}
          height="auto"
        >
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Cơ cấu vai trò
              </span>
              <div className="space-y-2.5">
                {ROLE_PALETTE.map((item, idx) => {
                  const value = idx === 0 ? adminCount : staffCount;
                  const pct = totalAccounts > 0 ? (value / totalAccounts) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground/80">
                        <span className="flex items-center gap-1.5">
                          <span className={`size-2 rounded-full ${item.bgClass}`} />
                          {item.name.split(' (')[0]}
                        </span>
                        <span>
                          {value}{' '}
                          <span className="text-muted-foreground font-normal">
                            ({pct.toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ backgroundColor: item.color, width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 border-t border-border/40 pt-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Trạng thái hoạt động
              </span>
              <div className="space-y-2.5">
                {STATUS_PALETTE.map((item) => {
                  const key = statusKeyOf(item.name);
                  const value = STATUS_VALUE_BY_KEY[key]({
                    activeCount,
                    inactiveCount,
                    lockedCount,
                  });
                  const pct = totalAccounts > 0 ? (value / totalAccounts) * 100 : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground/80">
                        <span className="flex items-center gap-1.5">
                          <span className={`size-2 rounded-full ${item.bgClass}`} />
                          {item.name.split(' (')[0]}
                        </span>
                        <span>
                          {value}{' '}
                          <span className="text-muted-foreground font-normal">
                            ({pct.toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ backgroundColor: item.color, width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Cơ cấu vai trò"
          description="Tỷ lệ phần trăm giữa quản trị viên và nhân viên."
          icon={<ShieldCheck className="size-4" />}
          height={220}
          isEmpty={roleData.length === 0}
          emptyMessage="Không có dữ liệu vai trò"
          onClick={() => setZoomedChart('role')}
        >
          <ChartContainer config={pieConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="45%"
                innerRadius={CHART_DEFAULTS.pieInnerRadius}
                outerRadius={CHART_DEFAULTS.pieOuterRadius}
                paddingAngle={CHART_DEFAULTS.piePaddingAngle}
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const data = item?.payload as { name: string; value: number } | undefined;
                      return (
                        <span className="font-medium">
                          {data?.name || ''}: <span className="font-mono">{value as number}</span>{' '}
                          tài khoản
                        </span>
                      );
                    }}
                    hideLabel
                  />
                }
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
                content={() => renderLegend(roleData)}
              />
            </PieChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          title="Trạng thái hoạt động"
          description="Tỷ lệ phần trăm tài khoản đang hoạt động, tạm ngưng hoặc bị khóa."
          icon={<Lock className="size-4" />}
          height={220}
          isEmpty={statusData.length === 0}
          emptyMessage="Không có dữ liệu trạng thái"
          onClick={() => setZoomedChart('status')}
        >
          <ChartContainer config={pieConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                innerRadius={CHART_DEFAULTS.pieInnerRadius}
                outerRadius={CHART_DEFAULTS.pieOuterRadius}
                paddingAngle={CHART_DEFAULTS.piePaddingAngle}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const data = item?.payload as { name: string; value: number } | undefined;
                      return (
                        <span className="font-medium">
                          {data?.name || ''}: <span className="font-mono">{value as number}</span>{' '}
                          tài khoản
                        </span>
                      );
                    }}
                    hideLabel
                  />
                }
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
                content={() => renderLegend(statusData)}
              />
            </PieChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <Dialog open={zoomedChart === 'role'} onOpenChange={(open) => !open && setZoomedChart(null)}>
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích cơ cấu vai trò
            </DialogTitle>
            <DialogDescription className="text-xs">
              Biểu đồ trực quan và số liệu chi tiết về tỷ lệ Quản trị viên & Nhân viên.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {roleData.length > 0 ? (
                <ChartContainer config={pieConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={CHART_DEFAULTS.pieInnerRadiusLarge}
                      outerRadius={CHART_DEFAULTS.pieOuterRadiusLarge}
                      paddingAngle={CHART_DEFAULTS.piePaddingAngleLarge}
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span className="font-mono">{value as number} tài khoản</span>
                          )}
                          hideLabel
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">Không có dữ liệu vai trò</div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5">
                  {roleData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{item.value}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">
                          ({totalAccounts > 0 ? ((item.value / totalAccounts) * 100).toFixed(1) : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Vai trò trong hệ thống</p>
                <p className="leading-relaxed opacity-90">
                  Quản trị viên có toàn quyền cấu hình dữ liệu, quản lý thành viên và theo dõi doanh
                  thu. Nhân viên chỉ được xem và thao tác dữ liệu được giao.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={zoomedChart === 'status'}
        onOpenChange={(open) => !open && setZoomedChart(null)}
      >
        <DialogContent className="sm:max-w-3xl bg-card border-border p-6 rounded-2xl">
          <DialogHeader className="border-b border-border/50 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Phân tích trạng thái hoạt động
            </DialogTitle>
            <DialogDescription className="text-xs">
              Biểu đồ trực quan và số liệu chi tiết về trạng thái tài khoản trên hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center pt-4">
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {statusData.length > 0 ? (
                <ChartContainer config={pieConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={CHART_DEFAULTS.pieInnerRadiusLarge}
                      outerRadius={CHART_DEFAULTS.pieOuterRadiusLarge}
                      paddingAngle={CHART_DEFAULTS.piePaddingAngleLarge}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => (
                            <span className="font-mono">{value as number} tài khoản</span>
                          )}
                          hideLabel
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Không có dữ liệu trạng thái
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80 flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{item.value}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">
                          ({totalAccounts > 0 ? ((item.value / totalAccounts) * 100).toFixed(1) : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary">
                <p className="font-semibold mb-1">Trạng thái tài khoản</p>
                <p className="leading-relaxed opacity-90">
                  Tài khoản bị khóa sẽ không thể truy cập hệ thống. Tài khoản tạm ngưng có thể kích
                  hoạt lại bất cứ lúc nào bởi Quản trị viên.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
