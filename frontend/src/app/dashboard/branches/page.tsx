'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { branchService } from '@/lib/services/branch.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { BranchModal } from './components/branch-modal';
import { VietnamMap } from './components/vietnam-map';
import { BranchesRegionChart } from './components/branches-region-chart';
import { DashboardHeader } from '@/components/dashboard-header';
import { BranchesFilter } from './components/branches-filter';
import { BranchesTable } from './components/branches-table';
import { BranchesCards } from './components/branches-cards';
import { BranchesPagination } from './components/branches-pagination';
import { DeleteBranchModal } from './components/delete-branch-modal';
import { BranchesSkeleton, BranchesMapSkeleton, BranchesChartSkeleton } from './components/branches-skeleton';
import type { IBranch } from '@/lib/types/branch';
import type { IAccount } from '@/lib/types/account';
import type { CreateBranchFormValues, EditBranchFormValues } from './branches.schema';

export default function BranchesPage() {
  // State for data
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [allBranchesForMap, setAllBranchesForMap] = useState<IBranch[]>([]);

  // Search & Filter state
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBranches, setTotalBranches] = useState(0);

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<IBranch | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  // Fetch branches list
  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    // Bổ sung độ trễ 5 giây để kiểm nghiệm skeleton loading
    await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      const res = await branchService.list({
        city: cityFilter || undefined,
        page: currentPage,
        limit: pageSize,
      });

      setBranches(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 1);
      setTotalBranches(res.data.meta.total || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách chi nhánh.');
    } finally {
      setIsLoading(false);
    }
  }, [cityFilter, currentPage, pageSize]);

  // Fetch all branches for map data
  const fetchAllBranchesForMap = useCallback(async () => {
    try {
      const res = await branchService.list({
        limit: 100, // Tối đa 100 theo quy định của backend DTO
      });
      setAllBranchesForMap(res.data.data || []);
    } catch (error) {
      console.error('Không thể tải dữ liệu bản đồ chi nhánh:', error);
    }
  }, []);

  // Fetch on mount and when filter updates
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchAllBranchesForMap();
  }, [fetchAllBranchesForMap]);

  // Handle Search Submission
  const handleSearchSubmit = (val: string) => {
    setCityFilter(val);
    setCurrentPage(1); // Reset page on search
  };

  // Handle create submit
  const handleCreateSubmit = async (data: CreateBranchFormValues) => {
    try {
      await branchService.create(data);
      toast.success('Thêm chi nhánh mới thành công!');
      fetchBranches();
      fetchAllBranchesForMap();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo chi nhánh.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (data: EditBranchFormValues) => {
    if (!editingBranch) return;

    try {
      await branchService.update(editingBranch.store_id, data);
      toast.success('Cập nhật thông tin chi nhánh thành công!');
      fetchBranches();
      fetchAllBranchesForMap();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật chi nhánh.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle delete confirmation action
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsActionLoading(true);
    try {
      await branchService.remove(deleteConfirmId);
      toast.success('Đã xóa chi nhánh khỏi hệ thống.');
      setDeleteConfirmId(null);
      fetchBranches();
      fetchAllBranchesForMap();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Không thể xóa chi nhánh.';
      toast.error(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <DashboardHeader
        title="Quản lý chi nhánh"
        description="Quản lý danh sách các chi nhánh cửa hàng, vị trí địa lý của hệ thống kinh doanh."
        buttonText="Thêm chi nhánh"
        onButtonClick={() => setIsCreateOpen(true)}
        isButtonDisabled={!isAdmin}
        buttonTooltip={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm chi nhánh' : undefined}
      />

      {/* Top Overview: Vietnam Map (2/3) + Region Donut Chart (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Vietnam Map – chiếm 2/3 */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <BranchesMapSkeleton />
          ) : (
            <VietnamMap
              branches={allBranchesForMap}
              selectedCity={cityFilter}
              onCitySelect={(city) => {
                setCityFilter(city);
                setCurrentPage(1);
              }}
            />
          )}
        </div>

        {/* Region Chart – chiếm 1/3 */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <BranchesChartSkeleton />
          ) : (
            <BranchesRegionChart branches={allBranchesForMap} />
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <BranchesFilter
        cityFilter={cityFilter}
        onSearchSubmit={handleSearchSubmit}
        onClearFilter={() => {
          setCityFilter('');
          setCurrentPage(1);
        }}
      />

      {/* Main Table / Cards */}
      <div className="w-full">
        {isLoading ? (
          <BranchesSkeleton />
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Building2 className="size-12 text-muted-foreground opacity-40" />
            <p className="text-foreground font-semibold text-base">Không tìm thấy chi nhánh nào</p>
            <p className="text-muted-foreground text-sm">
              Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <BranchesTable
              branches={branches}
              isAdmin={isAdmin}
              onEdit={(branch) => {
                setEditingBranch(branch);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
            />

            {/* Mobile Card View */}
            <BranchesCards
              branches={branches}
              isAdmin={isAdmin}
              onEdit={(branch) => {
                setEditingBranch(branch);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
            />

            {/* Pagination Controls */}
            <BranchesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalBranches={totalBranches}
              branchesLength={branches.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Create & Edit Branch Popup Modals */}
      <BranchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        branch={null}
        onSubmit={handleCreateSubmit}
      />

      <BranchModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingBranch(null);
        }}
        branch={editingBranch}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialogue */}
      <DeleteBranchModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isActionLoading}
      />
    </div>
  );
}
