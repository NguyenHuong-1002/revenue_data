'use client';

import { useState, useEffect } from 'react';
import {
  FileChartColumn,
  TrendingUp,
  Download,
  Loader2,
  Calendar,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reportService } from '@/lib/services/report.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Filter states
  const [fromMonth, setFromMonth] = useState('2022-01');
  const [toMonth, setToMonth] = useState('2022-06');
  const [topN, setTopN] = useState<number>(10);

  // Individual button loading states
  const [loadingStates, setLoadingStates] = useState({
    'revenue-pdf': false,
    'revenue-excel': false,
    'growth-pdf': false,
    'growth-excel': false,
  });

  useEffect(() => {
    setIsLoadingUser(true);
    accountService
      .me()
      .then((res) => {
        setCurrentUser(res.data);
      })
      .catch((err) => {
        console.error('Failed to get current user:', err);
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, []);

  const handleExport = async (
    type: 'revenue-pdf' | 'revenue-excel' | 'growth-pdf' | 'growth-excel'
  ) => {
    // Basic validations
    if (!fromMonth || !toMonth) {
      toast.error('Vui lòng chọn đầy đủ thời gian từ tháng và đến tháng.');
      return;
    }

    if (new Date(fromMonth) > new Date(toMonth)) {
      toast.error('Tháng bắt đầu không được lớn hơn tháng kết thúc.');
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [type]: true }));

    const params = {
      fromMonth,
      toMonth,
      topN: Number(topN),
    };

    let apiCall;
    let filename = '';

    switch (type) {
      case 'revenue-pdf':
        apiCall = () => reportService.exportRevenuePdf(params);
        filename = `revenue_report_${fromMonth}_to_${toMonth}.pdf`;
        break;
      case 'revenue-excel':
        apiCall = () => reportService.exportRevenueExcel(params);
        filename = `revenue_report_${fromMonth}_to_${toMonth}.xlsx`;
        break;
      case 'growth-pdf':
        apiCall = () => reportService.exportGrowthPdf(params);
        filename = `growth_report_${fromMonth}_to_${toMonth}.pdf`;
        break;
      case 'growth-excel':
        apiCall = () => reportService.exportGrowthExcel(params);
        filename = `growth_report_${fromMonth}_to_${toMonth}.xlsx`;
        break;
    }

    try {
      const response = await apiCall();
      const blob = new Blob([response.data], { type: response.data.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Xuất báo cáo thành công: ${filename}`);
    } catch (err: any) {
      console.error('Export report error:', err);
      let errorMessage = 'Lỗi khi xuất báo cáo. Vui lòng kiểm tra lại quyền hạn hoặc cấu hình hệ thống.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorObj = JSON.parse(text);
          if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        } catch (parseErr) {
          // Keep generic message
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-sm text-muted-foreground">Đang xác thực quyền truy cập...</span>
      </div>
    );
  }

  // Permission Restriction: Only admin can view reports management
  if (currentUser && currentUser.role !== 'ADMIN') {
    return (
      <div className="flex flex-1 flex-col p-6 gap-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <FileChartColumn className="size-8 text-blue-500" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Báo cáo doanh thu</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-muted/10 border border-border border-dashed rounded-xl">
          <ShieldAlert className="size-12 text-destructive opacity-80" />
          <p className="text-foreground font-semibold text-base">Quyền truy cập bị hạn chế</p>
          <p className="text-muted-foreground text-sm text-center max-w-md px-4">
            Bạn đang đăng nhập với quyền **Nhân viên (STAFF)**. Chỉ **Quản trị viên (ADMIN)** mới có
            quyền truy cập, tùy chỉnh và tải các báo cáo tài chính của hệ thống.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-5xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileChartColumn className="size-8 text-blue-500" />
            Báo cáo doanh thu
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý, tùy chỉnh bộ lọc và xuất các báo cáo doanh thu & tăng trưởng hệ thống.
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="pb-4 border-b border-border bg-muted/5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Calendar className="size-4 text-blue-500" />
            Tùy chọn cấu hình báo cáo
          </CardTitle>
          <CardDescription className="text-xs">
            Thiết lập khoảng thời gian và quy mô bộ lọc để áp dụng cho các báo cáo tải xuống.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fromMonth" className="text-xs font-semibold text-foreground">
                Từ tháng
              </Label>
              <Input
                id="fromMonth"
                type="month"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className="bg-background text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toMonth" className="text-xs font-semibold text-foreground">
                Đến tháng
              </Label>
              <Input
                id="toMonth"
                type="month"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="bg-background text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topN" className="text-xs font-semibold text-foreground">
                Số lượng Top (sản phẩm/chi nhánh)
              </Label>
              <Input
                id="topN"
                type="number"
                min={1}
                max={50}
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Report 1: Revenue */}
        <Card className="border border-border bg-card hover:shadow-md transition-all flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 shadow-sm border border-blue-500/5">
                <FileChartColumn className="size-7" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Báo cáo Doanh thu Hệ thống</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Báo cáo chi tiết về tình hình kinh doanh của toàn bộ chi nhánh, cơ cấu đóng góp sản
                  phẩm và thống kê các mặt hàng đem lại lợi nhuận lớn nhất.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 border-t border-border/40 bg-muted/5 flex flex-col sm:flex-row gap-3 p-4">
            <Button
              onClick={() => handleExport('revenue-pdf')}
              disabled={loadingStates['revenue-pdf']}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium shadow-sm hover:shadow-red-500/10 cursor-pointer text-xs"
            >
              {loadingStates['revenue-pdf'] ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Download className="size-4 mr-2" />
              )}
              Xuất file PDF
            </Button>
            <Button
              onClick={() => handleExport('revenue-excel')}
              disabled={loadingStates['revenue-excel']}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm hover:shadow-emerald-500/10 cursor-pointer text-xs"
            >
              {loadingStates['revenue-excel'] ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <FileSpreadsheet className="size-4 mr-2" />
              )}
              Xuất file Excel
            </Button>
          </CardContent>
        </Card>

        {/* Report 2: Growth & Forecasting */}
        <Card className="border border-border bg-card hover:shadow-md transition-all flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 shadow-sm border border-purple-500/5">
                <TrendingUp className="size-7" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold flex items-center gap-1.5">
                  Báo cáo Tăng trưởng & Dự báo
                  <Sparkles className="size-4 text-purple-500 shrink-0 animate-pulse" />
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Báo cáo tổng hợp tỷ lệ tăng trưởng doanh số hàng tháng, dự báo xu hướng doanh thu
                  kỳ tới thông qua thuật toán AI/Machine Learning và nhận định chiến lược kinh doanh.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 border-t border-border/40 bg-muted/5 flex flex-col sm:flex-row gap-3 p-4">
            <Button
              onClick={() => handleExport('growth-pdf')}
              disabled={loadingStates['growth-pdf']}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium shadow-sm hover:shadow-red-500/10 cursor-pointer text-xs"
            >
              {loadingStates['growth-pdf'] ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Download className="size-4 mr-2" />
              )}
              Xuất file PDF
            </Button>
            <Button
              onClick={() => handleExport('growth-excel')}
              disabled={loadingStates['growth-excel']}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm hover:shadow-emerald-500/10 cursor-pointer text-xs"
            >
              {loadingStates['growth-excel'] ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <FileSpreadsheet className="size-4 mr-2" />
              )}
              Xuất file Excel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
