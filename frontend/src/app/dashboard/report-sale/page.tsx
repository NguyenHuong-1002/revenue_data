'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  FileChartColumn,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saleReportService } from '@/lib/services/sale-report.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { CreateSaleReportModal } from './components/create-sale-report-modal';
import { EditSaleReportModal } from './components/edit-sale-report-modal';
import { Modal } from '@/components/ui/modal';
import { SaleReportsCharts } from './components/sale-reports-charts';
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
  }, [
    currentPage,
    productIdFilter,
    branchIdFilter,
    channelFilter,
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

  const handleBranchIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBranchIdFilter(e.target.value);
    setCurrentPage(1);
  };

  // Copy ID Helper
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Đã sao chép mã: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Channel badge configuration
  const getChannelBadge = (channel: string) => {
    const channelStyles: Record<string, string> = {
      'Online': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Bán lẻ': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'Phát sinh': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
      'Bán sỉ': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Siêu thị': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Hợp đồng': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Chi nhánh': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    return (
      <Badge
        variant="outline"
        className={`${channelStyles[channel] || 'bg-muted text-muted-foreground border-border'} px-2 py-0.5 font-medium`}
      >
        {channel}
      </Badge>
    );
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-xs">
            <FileChartColumn className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Báo cáo doanh số (Sale)</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý danh sách các báo cáo bán hàng chi tiết theo sản phẩm, chi nhánh và kênh bán lẻ
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 cursor-pointer shadow-sm">
            <Plus className="size-4" /> Thêm báo cáo
          </Button>
        )}
      </div>

      {/* ── Analytics Visual Charts ── */}
      <SaleReportsCharts reports={reports} />

      {/* ── Filters Card ── */}
      <Card className="border border-border/80 bg-card/40 backdrop-blur-xs">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
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

            {/* Filter 2: Mã chi nhánh */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mã chi nhánh..."
                value={branchIdFilter}
                onChange={handleBranchIdChange}
                className="pl-9"
              />
            </div>

            {/* Filter 3: Kênh phân phối */}
            <Select onValueChange={(val) => { setChannelFilter(val); setCurrentPage(1); }} value={channelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn kênh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả kênh</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Bán lẻ">Bán lẻ</SelectItem>
                <SelectItem value="Phát sinh">Phát sinh</SelectItem>
                <SelectItem value="Bán sỉ">Bán sỉ</SelectItem>
                <SelectItem value="Siêu thị">Siêu thị</SelectItem>
                <SelectItem value="Hợp đồng">Hợp đồng</SelectItem>
                <SelectItem value="Chi nhánh">Chi nhánh</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter 4: Từ tháng */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <Input
                type="month"
                value={fromMonth}
                onChange={(e) => { setFromMonth(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs"
              />
            </div>

            {/* Filter 5: Đến tháng */}
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
                <th className="px-5 py-4">Mã Báo Cáo (ID)</th>
                <th className="px-5 py-4">Sản Phẩm (Product)</th>
                <th className="px-5 py-4 text-right">Số Lượng Bán</th>
                <th className="px-5 py-4 text-center">Kênh Phân Phối</th>
                <th className="px-5 py-4">Chi Nhánh</th>
                <th className="px-5 py-4">Thời Gian</th>
                {isAdmin && <th className="px-5 py-4 text-center">Hành Động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
                      <span>Đang tải danh sách báo cáo doanh số...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ShieldAlert className="h-10 w-10 text-orange-500 opacity-60" />
                      <span className="font-semibold text-foreground">Không tìm thấy báo cáo doanh số nào</span>
                      <span className="text-xs max-w-sm">
                        Thử điều chỉnh lại bộ lọc hoặc khoảng thời gian tìm kiếm để hiển thị dữ liệu.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.sale_id} className="hover:bg-muted/15 transition-colors">
                    {/* ID Báo cáo */}
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span>{report.sale_id}</span>
                        <button
                          onClick={() => handleCopyId(report.sale_id)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-sm"
                        >
                          {copiedId === report.sale_id ? (
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



                    {/* Số lượng */}
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      {new Intl.NumberFormat().format(report.sold_quantity)}
                    </td>

                    {/* Kênh phân phối */}
                    <td className="px-5 py-3.5 text-center">
                      {getChannelBadge(report.distribution_channel)}
                    </td>

                    {/* Chi nhánh */}
                    <td className="px-5 py-3.5 text-muted-foreground font-medium text-xs">
                      {report.branch_id}
                    </td>

                    {/* Thời gian */}
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {report.time_report.slice(0, 10)}
                    </td>

                    {/* Hành động (Chỉ ADMIN) */}
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(report)}
                            className="size-8 cursor-pointer text-muted-foreground hover:text-blue-500 hover:border-blue-500/30"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteConfirmId(report.sale_id)}
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
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa báo cáo"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa báo cáo doanh số{' '}
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
