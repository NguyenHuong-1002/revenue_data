'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Warehouse } from 'lucide-react';
import { plantService } from '@/lib/services/plant.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { PlantModal } from './components/plant-modal';
import { DashboardHeader } from '@/components/dashboard-header';
import { PlantsStats } from './components/plants-stats';
import { PlantsFilter } from './components/plants-filter';
import { PlantsTable } from './components/plants-table';
import { PlantsCards } from './components/plants-cards';
import { PlantsPagination } from './components/plants-pagination';
import { DeletePlantModal } from './components/delete-plant-modal';
import { PlantsSkeleton, PlantsStatsSkeleton, PlantsChartSkeleton } from './components/plants-skeleton';
import { PlantsRegionChart } from './components/plants-region-chart';
import type { IPlant } from '@/lib/types/plant';
import type { IAccount } from '@/lib/types/account';
import type { CreatePlantFormValues, EditPlantFormValues } from './plants.schema';

const classifyRegion = (address: string): 'North' | 'Central' | 'South' => {
  const addr = address.toLowerCase();
  const north = ['hà nội', 'hanoi', 'hải phòng', 'hai phong', 'lạng sơn', 'lang son', 'vinh', 'bắc ninh', 'hưng yên', 'quảng ninh', 'miền bắc'];
  const central = ['đà nẵng', 'da nang', 'huế', 'hue', 'nha trang', 'đà lạt', 'da lat', 'quảng nam', 'khánh hòa', 'miền trung'];
  if (north.some(n => addr.includes(n))) return 'North';
  if (central.some(ce => addr.includes(ce))) return 'Central';
  return 'South';
};

export default function PlantsPage() {
  // State for data
  const [plants, setPlants] = useState<IPlant[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [allPlantsForChart, setAllPlantsForChart] = useState<IPlant[]>([]);

  // Search & Filter state
  const [addressFilter, setAddressFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'North' | 'Central' | 'South'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlants, setTotalPlants] = useState(0);

  const filteredPlants = useMemo(() => {
    if (regionFilter === 'ALL') return plants;
    return plants.filter((p) => classifyRegion(p.address) === regionFilter);
  }, [plants, regionFilter]);

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<IPlant | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch current user
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  // Fetch plants list
  const fetchPlants = useCallback(async () => {
    setIsLoading(true);
    // Bổ sung độ trễ 5 giây để kiểm nghiệm skeleton loading
    await new Promise((resolve) => setTimeout(resolve, 5000));
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

  // Fetch all plants for chart data
  const fetchAllPlantsForChart = useCallback(async () => {
    try {
      const res = await plantService.list({
        limit: 100,
      });
      setAllPlantsForChart(res.data.data || []);
    } catch (error) {
      console.error('Không thể tải danh sách nhà kho cho biểu đồ:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllPlantsForChart();
  }, [fetchAllPlantsForChart]);

  // Handle clear filters
  const handleClearFilters = () => {
    setAddressFilter('');
    setManagerFilter('');
    setRegionFilter('ALL');
    setCurrentPage(1);
  };

  // Handle create submit
  const handleCreateSubmit = async (data: CreatePlantFormValues) => {
    try {
      await plantService.create(data);
      toast.success('Thêm nhà kho mới thành công!');
      fetchPlants();
      fetchAllPlantsForChart();
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
      fetchAllPlantsForChart();
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
      fetchAllPlantsForChart();
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
      <DashboardHeader
        title="Quản lý nhà kho"
        description="Quản lý thông tin nhà kho, xưởng sản xuất, địa chỉ và thông tin liên hệ của quản lý kho."
        buttonText="Thêm nhà kho"
        onButtonClick={() => setIsCreateOpen(true)}
        isButtonDisabled={!isAdmin}
        buttonTooltip={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm nhà kho' : undefined}
        icon={Warehouse}
      />

      {/* Overview Stats + Region Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {isLoading ? (
            <PlantsStatsSkeleton />
          ) : (
            <PlantsStats totalPlants={totalPlants} />
          )}
          <PlantsFilter
            addressFilter={addressFilter}
            managerFilter={managerFilter}
            regionFilter={regionFilter}
            showAdvancedFilters={showAdvancedFilters}
            onToggleAdvancedFilters={() => setShowAdvancedFilters((prev) => !prev)}
            onSearchSubmit={(address, manager, region) => {
              setAddressFilter(address);
              setManagerFilter(manager);
              setRegionFilter(region);
              setCurrentPage(1);
            }}
            onResetFilters={handleClearFilters}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          {isLoading ? (
            <PlantsChartSkeleton />
          ) : (
            <PlantsRegionChart plants={allPlantsForChart} />
          )}
        </div>
      </div>

      {/* Main Table / Cards */}
      <div className="w-full">
        {isLoading ? (
          <PlantsSkeleton />
        ) : filteredPlants.length === 0 ? (
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
            <PlantsTable
              plants={filteredPlants}
              isAdmin={isAdmin}
              onEdit={(plant) => {
                setEditingPlant(plant);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
            />

            {/* Mobile Card View */}
            <PlantsCards
              plants={filteredPlants}
              isAdmin={isAdmin}
              onEdit={(plant) => {
                setEditingPlant(plant);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
            />

            {/* Pagination Controls */}
            <PlantsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalPlants={totalPlants}
              plantsLength={filteredPlants.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Create & Edit Plant Popup Modals */}
      <PlantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        plant={null}
        onSubmit={handleCreateSubmit}
      />

      <PlantModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingPlant(null);
        }}
        plant={editingPlant}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialogue */}
      <DeletePlantModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isActionLoading}
      />
    </div>
  );
}

