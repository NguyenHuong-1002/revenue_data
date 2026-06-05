'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  SlidersHorizontal,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { accountService } from '@/lib/services/account.service';
import { getAvatarUrl } from '@/lib/avatar';
import { toast } from 'sonner';
import { CreateAccountModal } from './components/create-account-modal';
import { EditAccountModal } from './components/edit-account-modal';
import { Modal } from './components/modal';
import { AccountsChart } from './components/accounts-chart';
import type { IAccount } from '@/lib/types/account';
import type { CreateAccountFormValues, EditAccountFormValues } from './accounts.schema';

export default function AccountsPage() {
  // State for data
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [chartAccounts, setChartAccounts] = useState<IAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Search & Filter state
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch current user
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  const fetchChartAccounts = useCallback(async () => {
    await Promise.resolve();
    if (!currentUser) return;
    if (currentUser.role !== 'ADMIN') return;
    try {
      const res = await accountService.list({
        page: 1,
        limit: 100,
      });
      setChartAccounts(res.data.data || []);
    } catch (error) {
      console.error('Không thể tải danh sách tài khoản cho biểu đồ.', error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchChartAccounts();
  }, [fetchChartAccounts]);

  // Fetch accounts list
  const fetchAccounts = useCallback(async () => {
    await Promise.resolve();
    if (!currentUser) return;
    if (currentUser.role !== 'ADMIN') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      let res;
      if (keyword || roleFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate) {
        res = await accountService.search({
          keyword: keyword || undefined,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          status_account: statusFilter === 'ALL' ? undefined : statusFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: currentPage,
          limit: pageSize,
        });
      } else {
        res = await accountService.list({
          page: currentPage,
          limit: pageSize,
        });
      }

      setAccounts(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 1);
      setTotalAccounts(res.data.meta.total || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách tài khoản.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, roleFilter, statusFilter, startDate, endDate, currentPage, pageSize, currentUser]);

  // Fetch on mount and when filter updates
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  // Handle Role Filter Change
  const handleRoleFilterChange = (value: 'ALL' | 'ADMIN' | 'STAFF') => {
    setRoleFilter(value);
    setCurrentPage(1); // Reset page on filter
  };

  // Handle Status Filter Change
  const handleStatusFilterChange = (value: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED') => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset page on filter
  };

  // Handle Start Date Change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  // Handle End Date Change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  // Handle create submit
  const handleCreateSubmit = async (data: CreateAccountFormValues) => {
    try {
      await accountService.create(data);
      toast.success('Tạo tài khoản mới thành công!');
      fetchAccounts();
      fetchChartAccounts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (data: EditAccountFormValues) => {
    if (!editingAccount) return;

    try {
      // Exclude empty password before updating
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }

      await accountService.update(editingAccount.account_id, payload);
      toast.success('Cập nhật thông tin tài khoản thành công!');
      fetchAccounts();
      fetchChartAccounts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle delete confirmation action
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsActionLoading(true);
    try {
      await accountService.remove(deleteConfirmId);
      toast.success('Đã xóa tài khoản khỏi hệ thống.');
      setDeleteConfirmId(null);
      fetchAccounts();
      fetchChartAccounts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Không thể xóa tài khoản.';
      toast.error(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Calculate statistics (quick counters)
  const adminCount = chartAccounts.filter((acc) => acc.role === 'ADMIN').length;
  const staffCount = chartAccounts.filter((acc) => acc.role === 'STAFF').length;

  const stats = useMemo(() => {
    const total = chartAccounts.length;
    
    // Tỉ lệ hoạt động (Active ratio)
    const activeCount = chartAccounts.filter((acc) => acc.status_account === 'ACTIVE').length;
    const activeRatio = total > 0 ? (activeCount / total) * 100 : 0;

    // Tốc độ tăng trưởng & % so với tháng trước
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfThisMonth = new Date(currentYear, currentMonth, 1);
    
    const startOfLastMonth = new Date(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1,
      1
    );

    const totalBeforeThisMonth = chartAccounts.filter(
      (acc) => new Date(acc.created_at) < startOfThisMonth
    ).length;

    const newThisMonth = chartAccounts.filter(
      (acc) => new Date(acc.created_at) >= startOfThisMonth
    ).length;

    const newLastMonth = chartAccounts.filter((acc) => {
      const date = new Date(acc.created_at);
      return date >= startOfLastMonth && date < startOfThisMonth;
    }).length;

    // % so với tháng trước
    const pctChange = totalBeforeThisMonth > 0 ? (newThisMonth / totalBeforeThisMonth) * 100 : 0;

    // Tốc độ tăng trưởng MoM
    let growthRate = 0;
    if (newLastMonth > 0) {
      growthRate = ((newThisMonth - newLastMonth) / newLastMonth) * 100;
    } else if (newThisMonth > 0) {
      growthRate = 100;
    }

    return {
      total,
      pctChange,
      growthRate,
      activeCount,
      activeRatio,
      newThisMonth,
    };
  }, [chartAccounts]);

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý tài khoản</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý thông tin, phân quyền truy cập và cài đặt tài khoản của toàn bộ nhân viên.
          </p>
        </div>
        <Button
          disabled={currentUser?.role !== 'ADMIN'}
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-4 mr-2" />
          Thêm tài khoản
        </Button>
      </div>

      {/* Summary stats */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${currentUser?.role !== 'ADMIN' ? 'opacity-50 pointer-events-none select-none' : ''}`}
      >
        {/* Card 1: Tổng tài khoản */}
        <Card className="bg-card border-border shadow-md relative overflow-hidden group hover:border-border/80 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Tổng tài khoản</span>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              
              <div className="flex items-center gap-1 mt-2">
                {stats.pctChange > 0 ? (
                  <>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                      <TrendingUp className="h-3 w-3" />
                      +{stats.pctChange.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">so với tháng trước</span>
                  </>
                ) : stats.pctChange < 0 ? (
                  <>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/25">
                      <TrendingDown className="h-3 w-3" />
                      {stats.pctChange.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">so với tháng trước</span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">Không đổi so với tháng trước</span>
                )}
              </div>
            </div>
            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Users className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tốc độ tăng trưởng */}
        <Card className="bg-card border-border shadow-md relative overflow-hidden group hover:border-border/80 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Tốc độ tăng trưởng</span>
              <p className="text-3xl font-bold text-foreground">
                {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
              </p>
              
              <div className="flex items-center gap-1 mt-2">
                {stats.growthRate > 0 ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="h-3 w-3" />
                    MoM Growth
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">Gia tăng thành viên ổn định</span>
                )}
              </div>
            </div>
            <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <TrendingUp className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Tỉ lệ người dùng đồng hành */}
        <Card className="bg-card border-border shadow-md relative overflow-hidden group hover:border-border/80 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm font-medium">Người dùng đồng hành</span>
              <p className="text-3xl font-bold text-foreground">
                {stats.activeRatio.toFixed(1)}%
              </p>
              
              <p className="text-[10px] text-muted-foreground mt-2">
                {stats.activeCount} / {stats.total} tài khoản đang hoạt động
              </p>
            </div>
            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <UserCheck className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div
        className={
          currentUser?.role !== 'ADMIN' ? 'opacity-50 pointer-events-none select-none' : ''
        }
      >
        <AccountsChart accounts={chartAccounts} />
      </div>

      {/* Search and Filters */}
      <Card
        className={`bg-card border-border shadow-sm overflow-hidden ${currentUser?.role !== 'ADMIN' ? 'opacity-50 pointer-events-none select-none' : ''}`}
      >
        <CardContent className="p-4 space-y-4">
          {/* Main search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo họ tên, email hoặc username..."
                value={keyword}
                onChange={handleSearchChange}
                className="pl-9 bg-muted/20 border-border h-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant={showAdvancedFilters || roleFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate ? "secondary" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-10 text-xs gap-2 cursor-pointer w-full sm:w-auto font-medium"
              >
                <SlidersHorizontal className="size-3.5" />
                Bộ lọc nâng cao
                {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate) && (
                  <Badge variant="default" className="ml-1 size-5 rounded-full flex items-center justify-center p-0 text-[10px] bg-blue-600 text-white border-none font-bold">
                    {Number(roleFilter !== 'ALL') + Number(statusFilter !== 'ALL') + Number(!!startDate) + Number(!!endDate)}
                  </Badge>
                )}
              </Button>

              {(keyword || roleFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setKeyword('');
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                    setStartDate('');
                    setEndDate('');
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Đặt lại
                </Button>
              )}
            </div>
          </div>

          {/* Advanced filters collapsible block */}
          {showAdvancedFilters && (
            <div className="p-4 bg-muted/20 border border-border/60 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Role Filter */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Vai trò</span>
                  <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                    <SelectTrigger className="w-full border-border h-9 text-xs">
                      <SelectValue placeholder="Tất cả vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                      <SelectItem value="STAFF">Nhân viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Trạng thái</span>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-full border-border h-9 text-xs">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                      <SelectItem value="LOCKED">Bị khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Từ ngày</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground dark:[color-scheme:dark] h-9 cursor-pointer"
                    max={endDate || undefined}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground block">Đến ngày</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground dark:[color-scheme:dark] h-9 cursor-pointer"
                    min={startDate || undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Tags */}
          {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate || keyword) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/45 items-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">Đang lọc theo:</span>
              
              {keyword && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Từ khóa: "{keyword}"
                  <button onClick={() => setKeyword('')} className="hover:text-destructive cursor-pointer">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {roleFilter !== 'ALL' && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Vai trò: {roleFilter === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                  <button onClick={() => setRoleFilter('ALL')} className="hover:text-destructive cursor-pointer">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {statusFilter !== 'ALL' && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Trạng thái: {statusFilter === 'ACTIVE' ? 'Hoạt động' : statusFilter === 'INACTIVE' ? 'Tạm ngưng' : 'Bị khóa'}
                  <button onClick={() => setStatusFilter('ALL')} className="hover:text-destructive cursor-pointer">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}

              {(startDate || endDate) && (
                <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground">
                  Thời gian: {startDate || '*'} - {endDate || '*'}
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:text-destructive cursor-pointer">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Accounts Table / Cards */}
      <div className="w-full">
        {currentUser && currentUser.role !== 'ADMIN' ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-muted/10 border border-border border-dashed rounded-xl">
            <ShieldAlert className="size-12 text-destructive opacity-80" />
            <p className="text-foreground font-semibold text-base">Quyền truy cập bị hạn chế</p>
            <p className="text-muted-foreground text-sm text-center max-w-md px-4">
              Bạn đang đăng nhập với quyền **Nhân viên (STAFF)**. Chỉ **Quản trị viên (ADMIN)** mới
              có quyền truy cập, chỉnh sửa và quản lý danh sách tài khoản.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm text-muted-foreground">Đang tải danh sách tài khoản...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Users className="size-12 text-muted-foreground opacity-40" />
            <p className="text-foreground font-semibold text-base">Không tìm thấy tài khoản nào</p>
            <p className="text-muted-foreground text-sm">
              Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Thành viên</th>
                    <th className="px-6 py-4">Liên hệ</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Hoạt động cuối</th>
                    <th className="px-6 py-4">Ngày tham gia</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground">
                  {accounts.map((account) => {
                    const isSelf = currentUser?.account_id === account.account_id;
                    const displayAvatar = getAvatarUrl(account.avatarURL);

                    return (
                      <tr key={account.account_id} className="hover:bg-muted/10 transition-colors">
                        {/* Member (Avatar + Name) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              {displayAvatar ? (
                                <AvatarImage src={displayAvatar} alt={account.fullname} />
                              ) : null}
                              <AvatarFallback className="bg-blue-500/10 text-blue-500 font-semibold uppercase">
                                {account.fullname.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {account.fullname}
                                {isSelf && (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[10px] py-0 px-1.5 font-normal"
                                  >
                                    Bạn
                                  </Badge>
                                )}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                @{account.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact info */}
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="size-3.5" />
                            {account.mail}
                          </span>
                        </td>

                        {/* System Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {account.role === 'ADMIN' ? (
                            <Badge
                              variant="outline"
                              className="bg-purple-500/5 text-purple-400 border-purple-500/20 font-semibold px-2 py-0.5"
                            >
                              Quản trị viên
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/5 text-blue-400 border-blue-500/20 font-semibold px-2 py-0.5"
                            >
                              Nhân viên
                            </Badge>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {account.status_account === 'ACTIVE' ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/5 text-green-400 border-green-500/20 font-semibold px-2 py-0.5"
                            >
                              Hoạt động
                            </Badge>
                          ) : account.status_account === 'INACTIVE' ? (
                            <Badge
                              variant="outline"
                              className="bg-zinc-500/5 text-zinc-400 border-zinc-500/20 font-semibold px-2 py-0.5"
                            >
                              Tạm ngưng
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-500/5 text-red-400 border-red-500/20 font-semibold px-2 py-0.5"
                            >
                              Bị khóa
                            </Badge>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {account.last_login_at ? (
                            <span className="text-xs">
                              {new Date(account.last_login_at).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">
                              Chưa đăng nhập
                            </span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="size-3.5" />
                            {new Date(account.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              onClick={() => {
                                setEditingAccount(account);
                                setIsEditOpen(true);
                              }}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Sửa thông tin"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              onClick={() => setDeleteConfirmId(account.account_id)}
                              disabled={isSelf}
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer ${
                                isSelf ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              title={isSelf ? 'Không thể tự xóa bản thân' : 'Xóa tài khoản'}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {accounts.map((account) => {
                const isSelf = currentUser?.account_id === account.account_id;
                const displayAvatar = getAvatarUrl(account.avatarURL);

                return (
                  <Card key={account.account_id} className="bg-card border-border shadow-sm">
                    <CardContent className="p-5 space-y-4">
                      {/* Avatar + Basic details */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border border-border">
                            {displayAvatar ? (
                              <AvatarImage src={displayAvatar} alt={account.fullname} />
                            ) : null}
                            <AvatarFallback className="bg-blue-500/10 text-blue-500 font-semibold uppercase">
                              {account.fullname.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              {account.fullname}
                              {isSelf && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[10px] py-0 px-1.5"
                                >
                                  Bạn
                                </Badge>
                              )}
                            </div>
                            <div className="text-muted-foreground text-xs">@{account.username}</div>
                          </div>
                        </div>

                        {/* Role & Status badges */}
                        <div className="flex flex-col items-end gap-1.5">
                          {account.role === 'ADMIN' ? (
                            <Badge
                              variant="outline"
                              className="bg-purple-500/5 text-purple-400 border-purple-500/20 text-xs font-semibold px-2 py-0.5"
                            >
                              Quản trị
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-xs font-semibold px-2 py-0.5"
                            >
                              Nhân viên
                            </Badge>
                          )}
                          {account.status_account === 'ACTIVE' ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/5 text-green-400 border-green-500/20 text-[10px] px-1.5 py-0 font-medium"
                            >
                              Hoạt động
                            </Badge>
                          ) : account.status_account === 'INACTIVE' ? (
                            <Badge
                              variant="outline"
                              className="bg-zinc-500/5 text-zinc-400 border-zinc-500/20 text-[10px] px-1.5 py-0 font-medium"
                            >
                              Tạm ngưng
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-500/5 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0 font-medium"
                            >
                              Bị khóa
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Contact and Join Date */}
                      <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span>{account.mail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>
                            Tham gia:{' '}
                            {new Date(account.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground/80">
                            Đăng nhập cuối:
                          </span>
                          {account.last_login_at ? (
                            <span>
                              {new Date(account.last_login_at).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            <span className="italic text-muted-foreground/60">Chưa đăng nhập</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                        <Button
                          onClick={() => {
                            setEditingAccount(account);
                            setIsEditOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Edit className="size-3.5 mr-1.5" />
                          Sửa
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirmId(account.account_id)}
                          disabled={isSelf}
                          variant="outline"
                          size="sm"
                          className={`h-8 border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white cursor-pointer ${
                            isSelf ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        >
                          <Trash2 className="size-3.5 mr-1.5" />
                          Xóa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-2 py-4">
                <span className="text-xs text-muted-foreground">
                  Hiển thị {accounts.length} trên tổng số {totalAccounts} tài khoản
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-border hover:bg-muted text-muted-foreground cursor-pointer"
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Trước
                  </Button>
                  <span className="text-sm font-medium px-3 py-1 bg-muted/40 rounded-lg border border-border">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-border hover:bg-muted text-muted-foreground cursor-pointer"
                  >
                    Sau
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Account Popup Modal */}
      <CreateAccountModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Account Popup Modal */}
      <EditAccountModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialogue */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa tài khoản"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Hành động này sẽ hủy bỏ mọi quyền
            truy cập của tài khoản này vào hệ thống và không thể khôi phục lại.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isActionLoading}
              onClick={() => setDeleteConfirmId(null)}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              disabled={isActionLoading}
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/95 text-white font-medium shadow-lg hover:shadow-destructive/10 cursor-pointer"
            >
              {isActionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
