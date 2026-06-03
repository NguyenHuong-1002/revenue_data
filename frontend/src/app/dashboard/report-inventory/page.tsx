'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Copy,
  Check,
  Calendar,
  Layers,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { inventoryReportService } from '@/lib/services/inventory-report.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { CreateInventoryReportModal } from './components/create-inventory-report-modal';
import { EditInventoryReportModal } from './components/edit-inventory-report-modal';
import { Modal } from './components/modal';
import { InventoryReportsCharts } from './components/inventory-reports-charts';
import type { IInventoryReport } from '@/lib/services/inventory-report.service';
import type { IAccount } from '@/lib/types/account';
import type { CreateInventoryReportFormValues, EditInventoryReportFormValues } from './report-inventory.schema';

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
  }, [
    currentPage,
    productIdFilter,
    plantIdFilter,
    fromMonth,
    toMonth,
  ]);

  // Fetch on mount and when filter updates
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle Input Changes with Page Reset
  const handleProductIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductIdFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePlantIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlantIdFilter(e.target.value);
    setCurrentPage(1);
  };

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
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-xs">
            <Database className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Báo cáo tồn kho (Inventory)</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý mức tồn kho sản phẩm theo các nhà máy sản xuất (Plants) toàn hệ thống
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 cursor-pointer shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="size-4" /> Thêm báo cáo
          </Button>
        )}
      </div>

      {/* ── Analytics Visual Charts ── */}
      <InventoryReportsCharts reports={reports} />

      {/* ── Filters Card ── */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-xs">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Filter 1: Mã sản phẩm */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mã sản phẩm (SP...)"
                value={productIdFilter}
                onChange={handleProductIdChange}
                className="pl-9"
              />
            </div>

            {/* Filter 2: Mã nhà máy */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mã nhà máy (PL...)"
                value={plantIdFilter}
                onChange={handlePlantIdChange}
                className="pl-9"
              />
            </div>

            {/* Filter 3: Từ tháng */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="month"
                value={fromMonth}
                onChange={(e) => { setFromMonth(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs"
              />
            </div>

            {/* Filter 4: Đến tháng */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="month"
                value={toMonth}
                onChange={(e) => { setToMonth(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Table & Data List ── */}
      <Card className="border border-border bg-card/60 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-4">Mã Tồn Kho (ID)</th>
                <th className="px-5 py-4">Sản Phẩm (Product)</th>
                <th className="px-5 py-4">Nhà Máy (Plant)</th>
                <th className="px-5 py-4 text-right">Số Lượng Tồn</th>
                <th className="px-5 py-4">Thời Gian Tuần</th>
                {isAdmin && <th className="px-5 py-4 text-center">Hành Động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                      <span>Đang tải danh sách tồn kho...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ShieldAlert className="h-10 w-10 text-orange-500 opacity-60" />
                      <span className="font-semibold text-foreground">Không tìm thấy báo cáo tồn kho nào</span>
                      <span className="text-xs max-w-sm">
                        Thử điều chỉnh lại bộ lọc hoặc khoảng thời gian tìm kiếm để hiển thị dữ liệu.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.inventory_id} className="hover:bg-muted/15 transition-colors">
                    {/* ID Báo cáo */}
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span>{report.inventory_id}</span>
                        <button
                          onClick={() => handleCopyId(report.inventory_id)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-sm"
                        >
                          {copiedId === report.inventory_id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Sản phẩm */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-foreground/80">
                        <span>{report.product_id}</span>
                        <button
                          onClick={() => handleCopyId(report.product_id)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-sm"
                        >
                          {copiedId === report.product_id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Nhà máy */}
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {report.plant_id}
                    </td>

                    {/* Số lượng */}
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      {new Intl.NumberFormat().format(report.quantity)}
                    </td>

                    {/* Thời gian */}
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {report.calendar_year_week ? report.calendar_year_week.slice(0, 10) : '-'}
                    </td>

                    {/* Hành động (Chỉ ADMIN) */}
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(report)}
                            className="size-8 cursor-pointer text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/30"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteConfirmId(report.inventory_id)}
                            className="size-8 cursor-pointer text-muted-foreground hover:text-destructive hover:border-destructive/30"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/10">
            <span className="text-xs text-muted-foreground">
              Hiển thị trang <strong className="text-foreground font-semibold">{currentPage}</strong> trên{' '}
              <strong className="text-foreground font-semibold">{totalPages}</strong> (Tổng cộng {totalReports} báo cáo)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="h-8 gap-1 font-medium cursor-pointer"
              >
                <ChevronLeft className="size-4" /> Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                className="h-8 gap-1 font-medium cursor-pointer"
              >
                Sau <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Modals & Dialogs ── */}
      <CreateInventoryReportModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditInventoryReportModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingReport(null);
        }}
        onSubmit={handleEditSubmit}
        report={editingReport}
      />

      {/* Xóa báo cáo Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa báo cáo tồn kho"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa báo cáo tồn kho{' '}
            <strong className="font-semibold text-foreground font-mono">{deleteConfirmId}</strong>?
            Hành động này không thể hoàn tác và dữ liệu sẽ biến mất vĩnh viễn khỏi hệ thống.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={isActionLoading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isActionLoading}>
              {isActionLoading ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
