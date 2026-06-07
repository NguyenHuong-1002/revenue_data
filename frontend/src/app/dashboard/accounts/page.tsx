'use client';

/* eslint-disable react-hooks/set-state-in-effect */

// ===== Trang Quản lý tài khoản (Accounts) =====
// Đây là trang chính cho module tài khoản, chịu trách nhiệm:
// - Quản lý state và gọi API
// - Phối hợp các component con
// - Xử lý các sự kiện CRUD (thêm/sửa/xóa)

import {
  Users,
  ShieldAlert,
  BarChart3,
  Table,
  Plus,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';
import { PaginationControls } from '@/components/pagination-controls';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { exportAccountsToExcel } from '@/lib/excel/account-excel';
import { accountService } from '@/lib/services/account.service';
import type { IAccount } from '@/lib/types/account';
import { cn } from '@/lib/utils';
import type { CreateAccountFormValues, EditAccountFormValues } from './accounts.schema';
import { AccountFilters } from './components/account-filters';
import { AccountMobileCards } from './components/account-mobile-cards';
import { AccountSkeleton } from './components/account-skeleton';
import { AccountStats } from './components/account-stats';
import { AccountTable } from './components/account-table';
import { AccountsChart } from './components/accounts-chart';
import { AccountsDistributionCharts } from './components/accounts-distribution-charts';
import { CreateAccountModal } from './components/create-account-modal';
import { DeleteAccountModal } from './components/delete-account-modal';
import { EditAccountModal } from './components/edit-account-modal';

export default function AccountsPage() {
  // ----- State dữ liệu -----
  const [accounts, setAccounts] = useState<IAccount[]>([]); // Danh sách tài khoản đang hiển thị
  const [chartAccounts, setChartAccounts] = useState<IAccount[]>([]); // Toàn bộ tài khoản cho biểu đồ
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null); // Người dùng đang đăng nhập
  const [isLoading, setIsLoading] = useState(true); // Load danh sách
  const [isActionLoading, setIsActionLoading] = useState(false); // Load cho action (xóa...)

  // ----- State tìm kiếm & lọc -----
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'STAFF'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeRange, setTimeRange] = useState('1month'); // Bộ lọc khoảng thời gian của biểu đồ & stats
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);

  // ----- State điều khiển modal -----
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'editor'>('stats');

  // ----- Lấy thông tin user đang đăng nhập -----
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  // ----- Lấy danh sách tài khoản cho biểu đồ (chỉ ADMIN) -----
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

  // ----- Lấy danh sách tài khoản (có lọc hoặc không) -----
  const fetchAccounts = useCallback(async () => {
    await Promise.resolve();
    if (!currentUser) return;
    if (currentUser.role !== 'ADMIN') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    // Giả lập delay 5 giây để quan sát hiệu ứng Skeleton loading
    await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      let res;
      // Nếu có filter => gọi API search, nếu không => gọi API list thường
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
    } catch {
      toast.error('Không thể tải danh sách tài khoản.');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, roleFilter, statusFilter, startDate, endDate, currentPage, pageSize, currentUser]);

  // Tự động fetch lại mỗi khi filter/page thay đổi
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // ----- Xử lý submit form TẠO tài khoản -----
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
      throw error; // Ném lại lỗi để modal biết mà giữ nguyên trạng thái
    }
  };

  // ----- Xử lý submit form SỬA tài khoản -----
  const handleEditSubmit = async (data: EditAccountFormValues) => {
    if (!editingAccount) return;

    try {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password; // Không gửi password nếu để trống
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

  // ----- Xử lý XÁC NHẬN xóa tài khoản -----
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

  // ----- Tính toán thống kê cho 3 thẻ summary -----
  // Các chỉ số: tổng số, % thay đổi, tốc độ tăng trưởng, tỉ lệ active...

  const stats = useMemo(() => {
    // Cấu hình số ngày lọc dựa trên timeRange của biểu đồ
    const referenceDate = new Date('2026-06-03');
    let daysToSubtract = 30;
    switch (timeRange) {
      case '7d':
        daysToSubtract = 7;
        break;
      case '1month':
      case '30d':
        daysToSubtract = 30;
        break;
      case '90d':
        daysToSubtract = 90;
        break;
      case '6m':
        daysToSubtract = 180;
        break;
      case '1year':
      case '1y':
      case '365d':
      default:
        daysToSubtract = 365;
        break;
    }

    // Thời gian của kỳ hiện tại
    const endOfCurrentPeriod = new Date(referenceDate);
    const startOfCurrentPeriod = new Date(referenceDate);
    startOfCurrentPeriod.setDate(startOfCurrentPeriod.getDate() - daysToSubtract);

    // Thời gian của kỳ trước đó (để so sánh đối chiếu)

    const startOfPreviousPeriod = new Date(startOfCurrentPeriod);
    startOfPreviousPeriod.setDate(startOfPreviousPeriod.getDate() - daysToSubtract);

    // Lọc danh sách tài khoản thuộc kỳ hiện tại
    const currentPeriodAccounts = chartAccounts.filter((acc) => {
      const createdTime = new Date(acc.created_at).getTime();
      return (
        createdTime >= startOfCurrentPeriod.getTime() && createdTime <= endOfCurrentPeriod.getTime()
      );
    });

    // Lọc danh sách tài khoản thuộc kỳ trước đó
    const previousPeriodAccounts = chartAccounts.filter((acc) => {
      const createdTime = new Date(acc.created_at).getTime();
      return (
        createdTime >= startOfPreviousPeriod.getTime() &&
        createdTime < startOfCurrentPeriod.getTime()
      );
    });

    const newInCurrent = currentPeriodAccounts.length;
    const newInPrevious = previousPeriodAccounts.length;

    // Số tài khoản được tạo trước kỳ hiện tại (dùng để tính % thay đổi quy mô)
    const totalBeforeCurrent = chartAccounts.filter(
      (acc) => new Date(acc.created_at).getTime() < startOfCurrentPeriod.getTime()
    ).length;

    // % thay đổi quy mô hệ thống trong kỳ
    const pctChange = totalBeforeCurrent > 0 ? (newInCurrent / totalBeforeCurrent) * 100 : 0;

    // Tốc độ tăng trưởng số lượng tài khoản đăng ký mới so với kỳ trước
    let growthRate = 0;
    if (newInPrevious > 0) {
      growthRate = ((newInCurrent - newInPrevious) / newInPrevious) * 100;
    } else if (newInCurrent > 0) {
      growthRate = 100;
    }

    // Tỉ lệ tài khoản đang hoạt động TRONG KỲ hiện tại
    const activeCountInPeriod = currentPeriodAccounts.filter(
      (acc) => acc.status_account === 'ACTIVE'
    ).length;
    const activeRatioInPeriod = newInCurrent > 0 ? (activeCountInPeriod / newInCurrent) * 100 : 0;

    return {
      total: newInCurrent, // Tổng tài khoản đăng ký trong kỳ
      pctChange,
      growthRate,
      activeCount: activeCountInPeriod, // Số tài khoản hoạt động trong kỳ
      activeRatio: activeRatioInPeriod, // Tỉ lệ hoạt động trong kỳ
      newThisMonth: newInCurrent,
    };
  }, [chartAccounts, timeRange]);

  // Kiểm tra quyền ADMIN để ẩn/hiện các chức năng
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleExportExcel = async () => {
    toast.loading('Đang tải danh sách tài khoản...', { id: 'export-excel' });
    try {
      // Fetch first page with max allowed limit of 100
      const firstPageRes = await accountService.list({
        page: 1,
        limit: 100,
      });

      let allAccounts = firstPageRes.data.data || [];
      const totalPages = firstPageRes.data.meta.totalPages || 1;

      if (totalPages > 1) {
        toast.loading(`Đang tải thêm dữ liệu (1/${totalPages})...`, { id: 'export-excel' });
        const promises = [];
        for (let p = 2; p <= totalPages; p++) {
          promises.push(accountService.list({ page: p, limit: 100 }));
        }

        const results = await Promise.all(promises);
        for (const r of results) {
          allAccounts = allAccounts.concat(r.data.data || []);
        }
      }

      if (allAccounts.length === 0) {
        toast.error('Không có dữ liệu tài khoản để xuất.', { id: 'export-excel' });
        return;
      }

      toast.loading('Đang khởi tạo file Excel...', { id: 'export-excel' });
      exportAccountsToExcel(allAccounts, currentUser?.fullname || currentUser?.username || 'Admin');
      toast.success('Xuất file Excel thành công!', { id: 'export-excel' });
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      toast.error('Có lỗi xảy ra khi tải và xuất file Excel.', { id: 'export-excel' });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* ===== HEADER: Tiêu đề ===== */}
      {isLoading ? (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-in fade-in duration-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-8 w-48 rounded-md" />
            </div>
            <Skeleton className="h-4 w-[450px] max-w-full rounded-md" />
          </div>
        </div>
      ) : (
        <DashboardHeader
          title="Quản lý tài khoản"
          description="Quản lý thông tin, phân quyền truy cập và cài đặt tài khoản của toàn bộ nhân viên."
          icon={Users}
        />
      )}

      {/* ── THANH CHUYỂN TAB ── */}
      {isLoading ? (
        <div className="flex border-b border-border/60 pb-px gap-2 overflow-x-auto scrollbar-none select-none animate-in fade-in duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Skeleton className="h-4 w-4 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5">
            <Skeleton className="h-4 w-4 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
        </div>
      ) : (
        <div className="flex border-b border-border/60 pb-px gap-2 overflow-x-auto scrollbar-none select-none">
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 rounded-t-lg cursor-pointer flex items-center gap-2 outline-none',
              activeTab === 'stats'
                ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Thống kê dữ liệu</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={cn(
              'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 rounded-t-lg cursor-pointer flex items-center gap-2 outline-none',
              activeTab === 'editor'
                ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Table className="h-4 w-4" />
            <span>Chỉnh sửa cơ sở dữ liệu (Excel Grid)</span>
          </button>
        </div>
      )}

      {/* ── NỘI DUNG TỪNG TAB ── */}
      <div className="flex flex-col gap-6">
        {/* ================= TAB 1: THỐNG KÊ DỮ LIỆU ================= */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* ===== Thống kê cơ cấu tài khoản (Vai trò & Trạng thái) ===== */}
            <div className={!isAdmin ? 'opacity-50 pointer-events-none select-none' : ''}>
              <AccountsDistributionCharts accounts={chartAccounts} isLoading={isLoading} />
            </div>

            {/* ===== Biểu đồ hoạt động tài khoản ===== */}
            <div className={!isAdmin ? 'opacity-50 pointer-events-none select-none' : ''}>
              <AccountsChart
                accounts={chartAccounts}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                isLoading={isLoading}
              />
            </div>

            {/* ===== 3 Thẻ thống kê (tổng, tăng trưởng, đồng hành) ===== */}
            <div className={!isAdmin ? 'opacity-50 pointer-events-none select-none' : ''}>
              <AccountStats stats={stats} timeRange={timeRange} isLoading={isLoading} />
            </div>
          </div>
        )}

        {/* ================= TAB 2: CHỈNH SỬA CƠ SỞ DỮ LIỆU ================= */}
        {activeTab === 'editor' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* ===== Thanh tìm kiếm + Bộ lọc nâng cao ===== */}
            <div className={!isAdmin ? 'opacity-50 pointer-events-none select-none' : ''}>
              <AccountFilters
                isLoading={isLoading}
                keyword={keyword}
                onKeywordChange={(value) => {
                  setKeyword(value);
                  setCurrentPage(1);
                }}
                roleFilter={roleFilter}
                onRoleFilterChange={(value) => {
                  setRoleFilter(value);
                  setCurrentPage(1);
                }}
                statusFilter={statusFilter}
                onStatusFilterChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                startDate={startDate}
                onStartDateChange={(value) => {
                  setStartDate(value);
                  setCurrentPage(1);
                }}
                endDate={endDate}
                onEndDateChange={(value) => {
                  setEndDate(value);
                  setCurrentPage(1);
                }}
                showAdvancedFilters={showAdvancedFilters}
                onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                onResetFilters={() => {
                  setKeyword('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Thanh thao tác cơ sở dữ liệu (Thêm tài khoản & Xuất Excel) */}
            {isAdmin &&
              (isLoading ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card border border-border/60 rounded-xl p-4 shadow-xs gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-md" />
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-28 rounded-lg" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card border border-border/60 rounded-xl p-4 shadow-xs gap-3">
                  <div className="text-xs md:text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-blue-500" />
                    Quản lý cơ sở dữ liệu tài khoản
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      variant="outline"
                      onClick={handleExportExcel}
                      className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white h-9 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="size-4" />
                      Xuất Excel
                    </Button>
                    <Button
                      onClick={() => setIsCreateOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9 px-4 shadow-sm shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="size-4" />
                      Thêm tài khoản
                    </Button>
                  </div>
                </div>
              ))}

            {/* ===== Nội dung chính: Excel Sheet Editor / Mobile cards ===== */}
            <div className="w-full">
              {!isAdmin ? (
                /* Trường hợp STAFF — hiển thị thông báo không có quyền */
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-muted/10 border border-border border-dashed rounded-xl">
                  <ShieldAlert className="size-12 text-destructive opacity-80" />
                  <p className="text-foreground font-semibold text-base">
                    Quyền truy cập bị hạn chế
                  </p>
                  <p className="text-muted-foreground text-sm text-center max-w-md px-4">
                    Bạn đang đăng nhập với quyền **Nhân viên (STAFF)**. Chỉ **Quản trị viên
                    (ADMIN)** mới có quyền truy cập, chỉnh sửa và quản lý danh sách tài khoản.
                  </p>
                </div>
              ) : isLoading ? (
                /* Trường hợp đang tải */
                <AccountSkeleton />
              ) : (
                <div className="space-y-4">
                  {/* Bảng danh sách tài khoản tối giản cho desktop */}
                  <div className="hidden md:block">
                    <AccountTable
                      accounts={accounts}
                      currentUser={currentUser}
                      onEdit={(account) => {
                        setEditingAccount(account);
                        setIsEditOpen(true);
                      }}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  </div>

                  {/* Truyền thống cho mobile (<md) */}
                  <div className="md:hidden">
                    <AccountMobileCards
                      accounts={accounts}
                      currentUser={currentUser}
                      onEdit={(account) => {
                        setEditingAccount(account);
                        setIsEditOpen(true);
                      }}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  </div>

                  {/* Phân trang */}
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalAccounts}
                    itemsLength={accounts.length}
                    onPageChange={setCurrentPage}
                    itemName="tài khoản"
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== Modal: Tạo tài khoản ===== */}
      <CreateAccountModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* ===== Modal: Sửa tài khoản ===== */}
      <EditAccountModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onSubmit={handleEditSubmit}
      />

      {/* ===== Modal: Xác nhận xóa tài khoản ===== */}
      <DeleteAccountModal
        isOpen={deleteConfirmId !== null}
        isLoading={isActionLoading}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
