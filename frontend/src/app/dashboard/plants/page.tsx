'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  MapPin,
  User,
  Phone,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { plantService } from '@/lib/services/plant.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { CreatePlantModal } from './components/create-plant-modal';
import { EditPlantModal } from './components/edit-plant-modal';
import { Modal } from './components/modal';
import type { IPlant } from '@/lib/types/plant';
import type { IAccount } from '@/lib/types/account';
import type { CreatePlantFormValues, EditPlantFormValues } from './plants.schema';

export default function PlantsPage() {
  // State for data
  const [plants, setPlants] = useState<IPlant[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Search & Filter state
  const [addressFilter, setAddressFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlants, setTotalPlants] = useState(0);

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<IPlant | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  // Fetch plants list
  const fetchPlants = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const res = await plantService.list({
        address: addressFilter || undefined,
        manager_name: managerFilter || undefined,
        page: currentPage,
        limit: pageSize,
      });

      setPlants(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 1);
      setTotalPlants(res.data.meta.total || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách nhà kho.');
    } finally {
      setIsLoading(false);
    }
  }, [addressFilter, managerFilter, currentPage, pageSize]);

  // Fetch on mount and when filter updates
  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // Handle Address Search
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressFilter(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  // Handle Manager Search
  const handleManagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManagerFilter(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  // Handle create submit
  const handleCreateSubmit = async (data: CreatePlantFormValues) => {
    try {
      await plantService.create(data);
      toast.success('Thêm nhà kho mới thành công!');
      fetchPlants();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo nhà kho.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (data: EditPlantFormValues) => {
    if (!editingPlant) return;

    try {
      await plantService.update(editingPlant.plant_id, data);
      toast.success('Cập nhật thông tin nhà kho thành công!');
      fetchPlants();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhà kho.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle delete confirmation action
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsActionLoading(true);
    try {
      await plantService.remove(deleteConfirmId);
      toast.success('Đã xóa nhà kho khỏi hệ thống.');
      setDeleteConfirmId(null);
      fetchPlants();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Không thể xóa nhà kho.';
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Quản lý nhà kho</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý thông tin nhà kho, xưởng sản xuất, địa chỉ và thông tin liên hệ của quản lý kho.
          </p>
        </div>
        <Button
          disabled={!isAdmin}
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm nhà kho' : undefined}
        >
          <Plus className="size-4 mr-2" />
          Thêm nhà kho
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm font-medium">Tổng số nhà kho</span>
              <p className="text-3xl font-bold text-foreground">{totalPlants}</p>
            </div>
            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Package className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 w-full md:max-w-2xl">
            {/* Address Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo địa chỉ..."
                value={addressFilter}
                onChange={handleAddressChange}
                className="pl-9 bg-muted/20 border-border"
              />
            </div>

            {/* Manager Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo người quản lý..."
                value={managerFilter}
                onChange={handleManagerChange}
                className="pl-9 bg-muted/20 border-border"
              />
            </div>
          </div>

          {(addressFilter || managerFilter) && (
            <Button
              variant="ghost"
              onClick={() => {
                setAddressFilter('');
                setManagerFilter('');
                setCurrentPage(1);
              }}
              className="h-9 px-3 text-muted-foreground hover:text-foreground cursor-pointer text-xs shrink-0"
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
            <span className="text-sm text-muted-foreground">Đang tải danh sách nhà kho...</span>
          </div>
        ) : plants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Package className="size-12 text-muted-foreground opacity-40" />
            <p className="text-foreground font-semibold text-base">Không tìm thấy nhà kho nào</p>
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
                    <th className="px-6 py-4">Mã nhà kho</th>
                    <th className="px-6 py-4">Tên nhà kho</th>
                    <th className="px-6 py-4">Địa chỉ</th>
                    <th className="px-6 py-4">Người quản lý</th>
                    <th className="px-6 py-4">Số điện thoại</th>
                    <th className="px-6 py-4">Ngày tạo</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-foreground">
                  {plants.map((plant) => (
                    <tr key={plant.plant_id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {plant.plant_id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {plant.name_plant}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 inline text-blue-500" />
                          {plant.address}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        <span className="flex items-center gap-1">
                          <User className="size-3.5 inline text-purple-500" />
                          {plant.manager_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="size-3.5 inline text-emerald-500" />
                          {plant.phone}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Calendar className="size-3.5" />
                          {new Date(plant.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            onClick={() => {
                              setEditingPlant(plant);
                              setIsEditOpen(true);
                            }}
                            disabled={!isAdmin}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              !isAdmin ? 'Bạn không có quyền sửa nhà kho này' : 'Sửa thông tin'
                            }
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirmId(plant.plant_id)}
                            disabled={!isAdmin}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={!isAdmin ? 'Bạn không có quyền xóa nhà kho này' : 'Xóa nhà kho'}
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
              {plants.map((plant) => (
                <Card key={plant.plant_id} className="bg-card border-border shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-base">
                        {plant.name_plant}
                      </h3>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ID: {plant.plant_id}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-blue-500" />
                        <span>Địa chỉ: {plant.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-purple-500" />
                        <span>Người quản lý: {plant.manager_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-emerald-500" />
                        <span>Số điện thoại: {plant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5" />
                        <span>
                          Ngày tạo:{' '}
                          {new Date(plant.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                      <Button
                        onClick={() => {
                          setEditingPlant(plant);
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
                        onClick={() => setDeleteConfirmId(plant.plant_id)}
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
                  Hiển thị {plants.length} trên tổng số {totalPlants} nhà kho
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

      {/* Create Plant Popup Modal */}
      <CreatePlantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Plant Popup Modal */}
      <EditPlantModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingPlant(null);
        }}
        plant={editingPlant}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialogue */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa nhà kho"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bạn có chắc chắn muốn xóa nhà kho này? Hành động này sẽ xóa hoàn toàn thông tin nhà kho
            khỏi cơ sở dữ liệu và không thể khôi phục lại.
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
