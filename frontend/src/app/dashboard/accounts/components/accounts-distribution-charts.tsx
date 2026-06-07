'use client';

import { Users } from 'lucide-react';
import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { IAccount } from '@/lib/types/account';

interface AccountsDistributionChartsProps {
  accounts: IAccount[];
}

export function AccountsDistributionCharts({ accounts }: AccountsDistributionChartsProps) {
  const [zoomedChart, setZoomedChart] = React.useState<'role' | 'status' | null>(null);

  // 1. Phân tích dữ liệu vai trò
  const roleData = React.useMemo(() => {
    const adminCount = accounts.filter((acc) => acc.role === 'ADMIN').length;
    const staffCount = accounts.filter((acc) => acc.role === 'STAFF').length;

    return [
      { name: 'Quản trị viên (ADMIN)', value: adminCount, color: '#60a5fa' },
      { name: 'Nhân viên (STAFF)', value: staffCount, color: '#34d399' }, 
    ].filter((item) => item.value > 0);
  }, [accounts]);

  // 2. Phân tích dữ liệu trạng thái
  const statusData = React.useMemo(() => {
    const activeCount = accounts.filter((acc) => acc.status_account === 'ACTIVE').length;
    const inactiveCount = accounts.filter((acc) => acc.status_account === 'INACTIVE').length;
    const lockedCount = accounts.filter((acc) => acc.status_account === 'LOCKED').length;

    return [
      { name: 'Hoạt động (ACTIVE)', value: activeCount, color: '#10b981' }, // Emerald
      { name: 'Tạm ngưng (INACTIVE)', value: inactiveCount, color: '#6b7280' }, // Gray
      { name: 'Bị khóa (LOCKED)', value: lockedCount, color: '#f43f5e' }, // Rose
    ].filter((item) => item.value > 0);
  }, [accounts]);

  const totalAccounts = accounts.length;
  const activeCount = accounts.filter((acc) => acc.status_account === 'ACTIVE').length;
  const inactiveCount = accounts.filter((acc) => acc.status_account === 'INACTIVE').length;
  const lockedCount = accounts.filter((acc) => acc.status_account === 'LOCKED').length;

  const adminCount = accounts.filter((acc) => acc.role === 'ADMIN').length;
  const staffCount = accounts.filter((acc) => acc.role === 'STAFF').length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-3 duration-300">
        {/* Cột 1: Chi tiết trạng thái & số lượng */}
        <Card className="bg-card border-border shadow-md flex flex-col justify-between">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Tổng quan</span>
                <Badge className="font-semibold text-xs py-0.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none hover:bg-blue-500/15">
                  {totalAccounts} Thành viên
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Phân bổ vai trò & trạng thái hoạt động.
              </CardDescription>
            </div>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-5 pt-1 pb-4">
            {/* Cơ cấu vai trò */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Cơ cấu vai trò
              </span>
              <div className="space-y-2.5">
                {/* Admin */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground/80">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-blue-500" />
                      Admin
                    </span>
                    <span>
                      {adminCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((adminCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalAccounts > 0 ? (adminCount / totalAccounts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                {/* Staff */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground/80">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-purple-500" />
                      Staff
                    </span>
                    <span>
                      {staffCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((staffCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalAccounts > 0 ? (staffCount / totalAccounts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trạng thái hoạt động */}
            <div className="space-y-3 border-t border-border/40 pt-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Trạng thái hoạt động
              </span>
              <div className="space-y-2.5">
                {/* Hoạt động */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground/80">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Hoạt động
                    </span>
                    <span>
                      {activeCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((activeCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalAccounts > 0 ? (activeCount / totalAccounts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                {/* Tạm ngưng */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground/80">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-gray-400" />
                      Tạm ngưng
                    </span>
                    <span>
                      {inactiveCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((inactiveCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gray-400 dark:bg-gray-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalAccounts > 0 ? (inactiveCount / totalAccounts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                {/* Bị khóa */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-foreground/80">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-rose-500" />
                      Bị khóa
                    </span>
                    <span>
                      {lockedCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((lockedCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalAccounts > 0 ? (lockedCount / totalAccounts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cột 2: Biểu đồ quạt Vai trò */}
        <Card
          onClick={() => setZoomedChart('role')}
          className="bg-card border-border shadow-md flex flex-col justify-between cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group"
        >
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Cơ cấu vai trò</CardTitle>
              <CardDescription className="text-xs">
                Tỷ lệ phần trăm giữa quản trị viên và nhân viên.
              </CardDescription>
            </div>

          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pb-4">
            {roleData.length > 0 ? (
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} tài khoản`} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">Không có dữ liệu vai trò</div>
            )}
          </CardContent>
        </Card>

        {/* Cột 3: Biểu đồ quạt Trạng thái */}
        <Card
          onClick={() => setZoomedChart('status')}
          className="bg-card border-border shadow-md flex flex-col justify-between cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group"
        >
          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Trạng thái hoạt động
              </CardTitle>
              <CardDescription className="text-xs">
                Tỷ lệ phần trăm tài khoản đang hoạt động, tạm ngưng hoặc bị khóa.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pb-4">
            {statusData.length > 0 ? (
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} tài khoản`} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                Không có dữ liệu trạng thái
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog phóng to biểu đồ Cơ cấu vai trò */}
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
            {/* Biểu đồ quạt phóng to */}
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} tài khoản`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">Không có dữ liệu vai trò</div>
              )}
            </div>

            {/* Chi tiết số liệu bên cạnh */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <span className="size-3 rounded-full bg-blue-500" />
                      Quản trị viên (ADMIN)
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{adminCount}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({totalAccounts > 0 ? ((adminCount / totalAccounts) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <span className="size-3 rounded-full bg-purple-500" />
                      Nhân viên (STAFF)
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{staffCount}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({totalAccounts > 0 ? ((staffCount / totalAccounts) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-600 dark:text-blue-400">
                <p className="font-semibold mb-1">💡 Vai trò trong hệ thống</p>
                <p className="leading-relaxed opacity-90">
                  Quản trị viên có toàn quyền cấu hình dữ liệu, quản lý thành viên và theo dõi doanh
                  thu. Nhân viên chỉ được xem và thao tác dữ liệu được giao.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog phóng to biểu đồ Trạng thái hoạt động */}
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
            {/* Biểu đồ quạt phóng to */}
            <div className="col-span-1 md:col-span-3 h-[320px] w-full flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} tài khoản`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Không có dữ liệu trạng thái
                </div>
              )}
            </div>

            {/* Chi tiết số liệu bên cạnh */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Chi tiết phân bổ
                </span>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <span className="size-3 rounded-full bg-emerald-500" />
                      Hoạt động (ACTIVE)
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{activeCount}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({totalAccounts > 0 ? ((activeCount / totalAccounts) * 100).toFixed(1) : 0}
                        %)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <span className="size-3 rounded-full bg-gray-400" />
                      Tạm ngưng (INACTIVE)
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{inactiveCount}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        (
                        {totalAccounts > 0 ? ((inactiveCount / totalAccounts) * 100).toFixed(1) : 0}
                        %)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <span className="size-3 rounded-full bg-rose-500" />
                      Bị khóa (LOCKED)
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{lockedCount}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">
                        ({totalAccounts > 0 ? ((lockedCount / totalAccounts) * 100).toFixed(1) : 0}
                        %)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400">
                <p className="font-semibold mb-1">💡 Trạng thái tài khoản</p>
                <li className="leading-relaxed opacity-90">
                  Tài khoản bị khóa sẽ không thể truy cập hệ thống. Tài khoản tạm ngưng có thể kích
                  hoạt lại bất cứ lúc nào bởi Quản trị viên.
                </li>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
