'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { inventoryReportService } from '@/lib/services/inventory-report.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';

import { Database } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { InventoryReportsFilter } from './components/inventory-reports-filter';
import { InventoryReportsTable } from './components/inventory-reports-table';
import { PaginationControls } from '@/components/pagination-controls';
import { DeleteInventoryReportModal } from './components/delete-inventory-report-modal';
import { CreateInventoryReportModal } from './components/create-inventory-report-modal';
import { EditInventoryReportModal } from './components/edit-inventory-report-modal';
import { InventoryReportsCharts } from './components/inventory-reports-charts';
import {
  InventoryReportsTableSkeleton,
  InventoryReportsFilterSkeleton,
} from './components/inventory-reports-skeleton';

import type { IInventoryReport } from '@/lib/services/inventory-report.service';
import type { IAccount } from '@/lib/types/account';
import type {
  CreateInventoryReportFormValues,
  EditInventoryReportFormValues,
} from './report-inventory.schema';

export default function InventoryReportsPage() {
  // State for data
  const [reports, setReports] = useState<IInventoryReport[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Search & Filter state
  const [productIdFilter, setProductIdFilter] = useState('');
  const [plantIdFilter, setPlantIdFilter] = useState('');
  const [fromMonth, setFromMonth] = useState('2022-01');
  const [toMonth, setToMonth] = useState('2022-06');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<IInventoryReport | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  // Fetch inventory reports list
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * 30;
      const res = await inventoryReportService.list({
        skip,
        limit: 30,
        product_id: productIdFilter.trim() || undefined,
        plant_id: plantIdFilter.trim() || undefined,
        fromMonth: fromMonth || undefined,
        toMonth: toMonth || undefined,
      });

      setReports(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 1);
      setTotalReports(res.data.meta.total || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách báo cáo tồn kho.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, productIdFilter, plantIdFilter, fromMonth, toMonth]);

  // Fetch on mount and when filter updates
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Copy ID Helper
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Đã sao chép mã: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handlers for CRUD operations
  const handleCreateSubmit = async (values: CreateInventoryReportFormValues) => {
    setIsActionLoading(true);
    try {
      await inventoryReportService.create(values);
      toast.success('Thêm báo cáo tồn kho thành công!');
      fetchReports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo báo cáo.');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditClick = (report: IInventoryReport) => {
    setEditingReport(report);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (values: EditInventoryReportFormValues) => {
    if (!editingReport) return;
    setIsActionLoading(true);
    try {
      await inventoryReportService.update(editingReport.inventory_id, values);
      toast.success('Cập nhật báo cáo thành công!');
      fetchReports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsActionLoading(true);
    try {
      await inventoryReportService.delete(deleteConfirmId);
      toast.success('Xóa báo cáo tồn kho thành công!');
      setDeleteConfirmId(null);
      fetchReports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa báo cáo.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <DashboardHeader
        title="Báo cáo tồn kho (Inventory)"
        description="Quản lý mức tồn kho sản phẩm theo các nhà máy sản xuất (Plants) toàn hệ thống"
        buttonText="Thêm báo cáo"
        onButtonClick={() => setIsCreateOpen(true)}
        isButtonDisabled={!isAdmin}
        buttonTooltip={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm báo cáo' : undefined}
        icon={Database}
        iconClassName="text-indigo-500"
      />

      {/* Analytics Visual Charts */}
      <InventoryReportsCharts reports={reports} />

      {/* Filters Card */}
      {isLoading && reports.length === 0 ? (
        <InventoryReportsFilterSkeleton />
      ) : (
        <InventoryReportsFilter
          productIdFilter={productIdFilter}
          plantIdFilter={plantIdFilter}
          fromMonth={fromMonth}
          toMonth={toMonth}
          onProductIdChange={(val) => {
            setProductIdFilter(val);
            setCurrentPage(1);
          }}
          onPlantIdChange={(val) => {
            setPlantIdFilter(val);
            setCurrentPage(1);
          }}
          onFromMonthChange={(val) => {
            setFromMonth(val);
            setCurrentPage(1);
          }}
          onToMonthChange={(val) => {
            setToMonth(val);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Main Table / Data List */}
      <div className="space-y-4">
        {isLoading ? (
          <InventoryReportsTableSkeleton isAdmin={isAdmin} />
        ) : (
          <InventoryReportsTable
            reports={reports}
            isLoading={false}
            isAdmin={isAdmin}
            onEdit={handleEditClick}
            onDelete={setDeleteConfirmId}
            copiedId={copiedId}
            onCopyId={handleCopyId}
          />
        )}

        {/* Pagination Footer */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalReports}
          itemsLength={reports.length}
          onPageChange={setCurrentPage}
          itemName="báo cáo tồn kho"
          isLoading={isLoading}
        />
      </div>

      {/* Create Inventory Report Modal */}
      <CreateInventoryReportModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Inventory Report Modal */}
      <EditInventoryReportModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingReport(null);
        }}
        onSubmit={handleEditSubmit}
        report={editingReport}
      />

      {/* Delete Confirmation Modal */}
      <DeleteInventoryReportModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isActionLoading}
        reportId={deleteConfirmId}
      />
    </div>
  );
}
