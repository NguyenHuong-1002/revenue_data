'use client';

/* eslint-disable react-hooks/set-state-in-effect */

// ===== Trang Quản lý tài khoản (Accounts) =====
// Đây là trang chính cho module tài khoản, chịu trách nhiệm:
// - Quản lý state và gọi API
// - Phối hợp các component con
// - Xử lý các sự kiện CRUD (thêm/sửa/xóa)

import { Users, ShieldAlert } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { accountService } from '@/lib/services/account.service';
import type { IAccount } from '@/lib/types/account';
import type { CreateAccountFormValues, EditAccountFormValues } from './accounts.schema';
import { AccountFilters } from './components/account-filters';
import { AccountMobileCards } from './components/account-mobile-cards';
import { AccountPagination } from './components/account-pagination';
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
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);

  // ----- State điều khiển modal -----
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    } catch (error) {
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
  const adminCount = chartAccounts.filter((acc) => acc.role === 'ADMIN').length;
  const staffCount = chartAccounts.filter((acc) => acc.role === 'STAFF').length;

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
    const endOfPreviousPeriod = new Date(startOfCurrentPeriod);
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

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      {/* ===== HEADER: Tiêu đề + Nút thêm tài khoản ===== */}
      <DashboardHeader
        title="Quản lý tài khoản"
        description="Quản lý thông tin, phân quyền truy cập và cài đặt tài khoản của toàn bộ nhân viên."
        buttonText="Thêm tài khoản"
        onButtonClick={() => setIsCreateOpen(true)}
        isButtonDisabled={!isAdmin}
        icon={Users}
      />

      {/* ===== 3 Thẻ thống kê (tổng, tăng trưởng, đồng hành) ===== */}
      {/* Mờ đi nếu không phải ADMIN */}
      <div className={!isAdmin ? 'opacity-50 pointer-events-none select-none' : ''}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-27.5 w-full" />
            <Skeleton className="h-27.5 w-full" />
            <Skeleton className="h-27.5 w-full" />
          </div>
        ) : (
          <AccountStats stats={stats} timeRange={timeRange} />
        )}
      </div>

      {/* ===== Biểu đồ hoạt động tài khoản ===== */}
      <div className={!isAdmin ? 'opacity-50 pointer-events-none select-none' : ''}>
        {isLoading ? (
          <Skeleton className="h-95 w-full" />
        ) : (
          <AccountsChart
            accounts={chartAccounts}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
        )}
      </div>

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

      {/* ===== Thống kê cơ cấu tài khoản (Vai trò & Trạng thái) ===== */}
      <div className={!isAdmin ? 'opacity-50 pointer-events-none select-none' : ''}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-70 w-full" />
            <Skeleton className="h-70 w-full" />
            <Skeleton className="h-70 w-full" />
          </div>
        ) : (
          <AccountsDistributionCharts accounts={chartAccounts} />
        )}
      </div>

      {/* ===== Nội dung chính: DS tài khoản (table desktop / card mobile) ===== */}
      <div className="w-full">
        {!isAdmin ? (
          /* Trường hợp STAFF — hiển thị thông báo không có quyền */
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-muted/10 border border-border border-dashed rounded-xl">
            <ShieldAlert className="size-12 text-destructive opacity-80" />
            <p className="text-foreground font-semibold text-base">Quyền truy cập bị hạn chế</p>
            <p className="text-muted-foreground text-sm text-center max-w-md px-4">
              Bạn đang đăng nhập với quyền **Nhân viên (STAFF)**. Chỉ **Quản trị viên (ADMIN)** mới
              có quyền truy cập, chỉnh sửa và quản lý danh sách tài khoản.
            </p>
          </div>
        ) : isLoading ? (
          /* Trường hợp đang tải */
          <AccountSkeleton />
        ) : accounts.length === 0 ? (
          /* Trường hợp không có kết quả */
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Users className="size-12 text-muted-foreground opacity-40" />
            <p className="text-foreground font-semibold text-base">Không tìm thấy tài khoản nào</p>
            <p className="text-muted-foreground text-sm">
              Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.
            </p>
          </div>
        ) : (
          /* Danh sách tài khoản */
          <div className="space-y-4">
            {/* Bảng cho desktop (>=md) */}
            <AccountTable
              accounts={accounts}
              currentUser={currentUser}
              onEdit={(account) => {
                setEditingAccount(account);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
            {/* Card cho mobile (<md) */}
            <AccountMobileCards
              accounts={accounts}
              currentUser={currentUser}
              onEdit={(account) => {
                setEditingAccount(account);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
            {/* Phân trang */}
            <AccountPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalAccounts={totalAccounts}
              accountsLength={accounts.length}
              onPageChange={setCurrentPage}
            />
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
