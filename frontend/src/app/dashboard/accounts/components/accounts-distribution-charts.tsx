'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Shield, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import type { IAccount } from '@/lib/types/account';
import { Modal } from '@/components/ui/modal';

interface AccountsDistributionChartsProps {
  accounts: IAccount[];
}

export function AccountsDistributionCharts({ accounts }: AccountsDistributionChartsProps) {
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // 1. Phân tích dữ liệu vai trò
  const roleData = React.useMemo(() => {
    const adminCount = accounts.filter((acc) => acc.role === 'ADMIN').length;
    const staffCount = accounts.filter((acc) => acc.role === 'STAFF').length;

    return [
      { name: 'Quản trị viên (ADMIN)', value: adminCount, color: '#3b82f6' }, // Blue
      { name: 'Nhân viên (STAFF)', value: staffCount, color: '#a855f7' }, // Purple
    ].filter(item => item.value > 0);
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
    ].filter(item => item.value > 0);
  }, [accounts]);

  const totalAccounts = accounts.length;
  const activeCount = accounts.filter((acc) => acc.status_account === 'ACTIVE').length;
  const inactiveCount = accounts.filter((acc) => acc.status_account === 'INACTIVE').length;
  const lockedCount = accounts.filter((acc) => acc.status_account === 'LOCKED').length;

  const adminCount = accounts.filter((acc) => acc.role === 'ADMIN').length;
  const staffCount = accounts.filter((acc) => acc.role === 'STAFF').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Cột 1: Chi tiết trạng thái & số lượng */}
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground">Tổng quan thành viên</CardTitle>
          <CardDescription className="text-xs">
            Chi tiết phân bổ vai trò và trạng thái hoạt động của nhân sự.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tổng số thành viên (Click để mở chi tiết cấu trúc thành viên) */}
          <div 
            onClick={() => setIsDetailOpen(true)}
            className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/70 active:scale-[0.99] rounded-xl border border-border/50 hover:border-border/80 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Tổng thành viên hệ thống</p>
                <h3 className="text-xl font-extrabold text-foreground">{totalAccounts} tài khoản</h3>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:text-white transition-all">
              Chi tiết
            </span>
          </div>

          {/* Chi tiết vai trò */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cơ cấu chức vụ</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 border border-border/40 rounded-lg bg-card flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Admin
                </span>
                <span className="font-bold text-foreground">{adminCount}</span>
              </div>
              <div className="p-2 border border-border/40 rounded-lg bg-card flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-purple-500" />
                  Staff
                </span>
                <span className="font-bold text-foreground">{staffCount}</span>
              </div>
            </div>
          </div>

          {/* Chi tiết trạng thái */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái hoạt động</h4>
            <div className="space-y-2">
              {/* Active */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <CheckCircle className="size-3.5 text-emerald-500" />
                  Hoạt động
                </span>
                <span className="font-bold text-foreground">
                  {activeCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((activeCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
              {/* Inactive */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-gray-500" />
                  Tạm ngưng
                </span>
                <span className="font-bold text-foreground">
                  {inactiveCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((inactiveCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
              {/* Locked */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Lock className="size-3.5 text-rose-500" />
                  Bị khóa
                </span>
                <span className="font-bold text-foreground">
                  {lockedCount} <span className="text-muted-foreground font-normal">({totalAccounts > 0 ? ((lockedCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cột 2: Biểu đồ quạt Vai trò */}
      <Card className="bg-card border-border shadow-md flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-foreground">Cơ cấu vai trò</CardTitle>
          <CardDescription className="text-xs">
            Tỷ lệ phần trăm giữa quản trị viên và nhân viên.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center items-center h-[220px] pb-4">
          {roleData.length > 0 ? (
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
                <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-muted-foreground italic">Không có dữ liệu vai trò</div>
          )}
        </CardContent>
      </Card>

      {/* Cột 3: Biểu đồ quạt Trạng thái */}
      <Card className="bg-card border-border shadow-md flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-foreground">Trạng thái hoạt động</CardTitle>
          <CardDescription className="text-xs">
            Tỷ lệ phần trăm tài khoản đang hoạt động, tạm ngưng hoặc bị khóa.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center items-center h-[220px] pb-4">
          {statusData.length > 0 ? (
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
                <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-muted-foreground italic">Không có dữ liệu trạng thái</div>
          )}
        </CardContent>
      </Card>

      {/* Modal hiển thị chi tiết cơ cấu thành viên dạng các thanh tỉ lệ trực quan */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Chi tiết cơ cấu thành viên">
        <div className="space-y-6 pt-2">
          {/* Nhóm Vai trò */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cơ cấu vai trò</h4>
            <div className="space-y-3">
              {/* ADMIN Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-500" />
                    Quản trị viên (ADMIN)
                  </span>
                  <span className="text-foreground/90">{adminCount} / {totalAccounts} ({totalAccounts > 0 ? ((adminCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAccounts > 0 ? (adminCount / totalAccounts) * 100 : 0}%` }} />
                </div>
              </div>

              {/* STAFF Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-purple-500" />
                    Nhân viên (STAFF)
                  </span>
                  <span className="text-foreground/90">{staffCount} / {totalAccounts} ({totalAccounts > 0 ? ((staffCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAccounts > 0 ? (staffCount / totalAccounts) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Nhóm Trạng thái */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trạng thái hoạt động</h4>
            <div className="space-y-3">
              {/* ACTIVE */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <CheckCircle className="size-3.5 text-emerald-500" />
                    Hoạt động (ACTIVE)
                  </span>
                  <span className="text-foreground/90">{activeCount} / {totalAccounts} ({totalAccounts > 0 ? ((activeCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAccounts > 0 ? (activeCount / totalAccounts) * 100 : 0}%` }} />
                </div>
              </div>

              {/* INACTIVE */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="size-3.5 text-gray-500" />
                    Tạm ngưng (INACTIVE)
                  </span>
                  <span className="text-foreground/90">{inactiveCount} / {totalAccounts} ({totalAccounts > 0 ? ((inactiveCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-gray-400 dark:bg-gray-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAccounts > 0 ? (inactiveCount / totalAccounts) * 100 : 0}%` }} />
                </div>
              </div>

              {/* LOCKED */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <Lock className="size-3.5 text-rose-500" />
                    Bị khóa (LOCKED)
                  </span>
                  <span className="text-foreground/90">{lockedCount} / {totalAccounts} ({totalAccounts > 0 ? ((lockedCount / totalAccounts) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalAccounts > 0 ? (lockedCount / totalAccounts) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
