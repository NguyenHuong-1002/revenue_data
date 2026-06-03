'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { branchService } from '@/lib/services/branch.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { CreateBranchModal } from './components/create-branch-modal';
import { EditBranchModal } from './components/edit-branch-modal';
import { Modal } from './components/modal';
import type { IBranch } from '@/lib/types/branch';
import type { IAccount } from '@/lib/types/account';
import type { CreateBranchFormValues, EditBranchFormValues } from './branches.schema';

export default function BranchesPage() {
  // State for data
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Search & Filter state
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
    await Promise.resolve();
    setIsLoading(true);
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

  // Fetch on mount and when filter updates
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityFilter(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  // Handle create submit
  const handleCreateSubmit = async (data: CreateBranchFormValues) => {
    try {
      await branchService.create(data);
      toast.success('Thêm chi nhánh mới thành công!');
      fetchBranches();
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý chi nhánh</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý danh sách các chi nhánh cửa hàng, vị trí địa lý của hệ thống kinh doanh.
          </p>
        </div>
        <Button
          disabled={!isAdmin}
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm chi nhánh' : undefined}
        >
          <Plus className="size-4 mr-2" />
          Thêm chi nhánh
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm font-medium">Tổng số chi nhánh</span>
              <p className="text-3xl font-bold text-foreground">{totalBranches}</p>
            </div>
            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Building2 className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Keyword Search */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo thành phố..."
              value={cityFilter}
              onChange={handleSearchChange}
              className="pl-9 bg-muted/20 border-border"
            />
          </div>
          {cityFilter && (
            <Button
              variant="ghost"
              onClick={() => {
                setCityFilter('');
                setCurrentPage(1);
              }}
              className="h-9 px-3 text-muted-foreground hover:text-foreground cursor-pointer text-xs"
            >
              Xóa bộ lọc
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Main Table / Cards */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm text-muted-foreground">Đang tải danh sách chi nhánh...</span>
          </div>
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
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Mã chi nhánh</th>
                    <th className="px-6 py-4">Tên chi nhánh</th>
                    <th className="px-6 py-4">Thành phố</th>
                    <th className="px-6 py-4">Ngày tạo</th>
                    <th className="px-6 py-4">Ngày cập nhật</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground">
                  {branches.map((branch) => (
                    <tr key={branch.store_id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {branch.store_id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">{branch.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="bg-blue-50/5 text-blue-400 border-blue-500/20 px-2 py-0.5"
                        >
                          <MapPin className="size-3 mr-1 inline" />
                          {branch.city}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Calendar className="size-3.5" />
                          {new Date(branch.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Calendar className="size-3.5" />
                          {new Date(branch.updated_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            onClick={() => {
                              setEditingBranch(branch);
                              setIsEditOpen(true);
                            }}
                            disabled={!isAdmin}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              !isAdmin ? 'Bạn không có quyền sửa chi nhánh này' : 'Sửa thông tin'
                            }
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirmId(branch.store_id)}
                            disabled={!isAdmin}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              !isAdmin ? 'Bạn không có quyền xóa chi nhánh này' : 'Xóa chi nhánh'
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {branches.map((branch) => (
                <Card key={branch.store_id} className="bg-card border-border shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground text-base">{branch.name}</h3>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ID: {branch.store_id}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50/5 text-blue-400 border-blue-500/20 px-2 py-0.5 text-xs"
                      >
                        <MapPin className="size-3 mr-1 inline" />
                        {branch.city}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5" />
                        <span>
                          Ngày tạo:{' '}
                          {new Date(branch.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5" />
                        <span>
                          Cập nhật:{' '}
                          {new Date(branch.updated_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                      <Button
                        onClick={() => {
                          setEditingBranch(branch);
                          setIsEditOpen(true);
                        }}
                        disabled={!isAdmin}
                        variant="outline"
                        size="sm"
                        className="h-8 border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Edit className="size-3.5 mr-1.5" />
                        Sửa
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirmId(branch.store_id)}
                        disabled={!isAdmin}
                        variant="outline"
                        size="sm"
                        className="h-8 border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-3.5 mr-1.5" />
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-2 py-4">
                <span className="text-xs text-muted-foreground">
                  Hiển thị {branches.length} trên tổng số {totalBranches} chi nhánh
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

      {/* Create Branch Popup Modal */}
      <CreateBranchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Branch Popup Modal */}
      <EditBranchModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingBranch(null);
        }}
        branch={editingBranch}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialogue */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa chi nhánh"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bạn có chắc chắn muốn xóa chi nhánh này? Hành động này sẽ xóa hoàn toàn thông tin chi
            nhánh khỏi cơ sở dữ liệu và không thể khôi phục lại.
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
