'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { FileChartColumn } from 'lucide-react';
import { saleReportService } from '@/lib/services/sale-report.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';

import { DashboardHeader } from '@/components/dashboard-header';
import { PaginationControls } from '@/components/pagination-controls';
import { CreateSaleReportModal } from './components/create-sale-report-modal';
import { EditSaleReportModal } from './components/edit-sale-report-modal';
import { SaleReportsCharts } from './components/sale-reports-charts';
import { SaleReportsFilter } from './components/sale-reports-filter';
import { SaleReportsTable } from './components/sale-reports-table';
import { DeleteSaleReportModal } from './components/delete-sale-report-modal';
import {
  SaleReportsChartsSkeleton,
  SaleReportsFilterSkeleton,
  SaleReportsTableSkeleton,
} from './components/sale-reports-skeleton';

import type { ISaleReport } from '@/lib/services/sale-report.service';
import type { IAccount } from '@/lib/types/account';
import type { CreateSaleReportFormValues, EditSaleReportFormValues } from './report-sale.schema';

export default function SaleReportsPage() {
  // State for data
  const [reports, setReports] = useState<ISaleReport[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Search & Filter state
  const [productIdFilter, setProductIdFilter] = useState('');
  const [branchIdFilter, setBranchIdFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [fromMonth, setFromMonth] = useState('2022-01');
  const [toMonth, setToMonth] = useState('2022-06');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ISaleReport | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  // Fetch sale reports list
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * 30;
      const res = await saleReportService.list({
        skip,
        limit: 30,
        product_id: productIdFilter.trim() || undefined,
        branch_id: branchIdFilter.trim() || undefined,
        distribution_channel: channelFilter === 'ALL' ? undefined : channelFilter,
        fromMonth: fromMonth || undefined,
        toMonth: toMonth || undefined,
      });

      setReports(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 1);
      setTotalReports(res.data.meta.total || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách báo cáo doanh số.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, productIdFilter, branchIdFilter, channelFilter, fromMonth, toMonth]);

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
  const handleCreateSubmit = async (values: CreateSaleReportFormValues) => {
    setIsActionLoading(true);
    try {
      await saleReportService.create(values);
      toast.success('Thêm báo cáo doanh số thành công!');
      fetchReports();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo báo cáo.');
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditClick = (report: ISaleReport) => {
    setEditingReport(report);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (values: EditSaleReportFormValues) => {
    if (!editingReport) return;
    setIsActionLoading(true);
    try {
      await saleReportService.update(editingReport.sale_id, values);
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
      await saleReportService.delete(deleteConfirmId);
      toast.success('Xóa báo cáo doanh số thành công!');
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
      {/* ── Header ── */}
      <DashboardHeader
        title="Báo cáo doanh số (Sale)"
        description="Quản lý danh sách các báo cáo bán hàng chi tiết theo sản phẩm, chi nhánh và kênh bán lẻ"
        buttonText="Thêm báo cáo"
        onButtonClick={() => setIsCreateOpen(true)}
        isButtonDisabled={!isAdmin}
        buttonTooltip={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm báo cáo' : undefined}
        icon={FileChartColumn}
      />

      {/* ── Analytics Visual Charts ── */}
      {isLoading && reports.length === 0 ? (
        <SaleReportsChartsSkeleton />
      ) : (
        <SaleReportsCharts reports={reports} />
      )}

      {/* ── Filters Card ── */}
      {isLoading && reports.length === 0 ? (
        <SaleReportsFilterSkeleton />
      ) : (
        <SaleReportsFilter
          productIdFilter={productIdFilter}
          branchIdFilter={branchIdFilter}
          channelFilter={channelFilter}
          fromMonth={fromMonth}
          toMonth={toMonth}
          onProductIdChange={(val) => {
            setProductIdFilter(val);
            setCurrentPage(1);
          }}
          onBranchIdChange={(val) => {
            setBranchIdFilter(val);
            setCurrentPage(1);
          }}
          onChannelChange={(val) => {
            setChannelFilter(val);
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

      {/* ── Table & Data List ── */}
      <div className="space-y-4">
        {isLoading && reports.length === 0 ? (
          <SaleReportsTableSkeleton isAdmin={isAdmin} />
        ) : (
          <SaleReportsTable
            reports={reports}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onEdit={handleEditClick}
            onDelete={setDeleteConfirmId}
            copiedId={copiedId}
            onCopyId={handleCopyId}
          />
        )}

        {/* ── Pagination Footer ── */}
        {!isLoading && reports.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalReports}
            itemsLength={reports.length}
            onPageChange={setCurrentPage}
            itemName="báo cáo doanh số"
            isLoading={isLoading}
          />
        )}
      </div>

      {/* ── Modals & Dialogs ── */}
      <CreateSaleReportModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditSaleReportModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingReport(null);
        }}
        onSubmit={handleEditSubmit}
        report={editingReport}
      />

      {/* Xóa báo cáo Modal */}
      <DeleteSaleReportModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isActionLoading}
        reportId={deleteConfirmId}
      />
    </div>
  );
}
