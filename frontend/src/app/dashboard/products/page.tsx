'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
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
  Layers,
  Settings2,
  Sparkles,
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
import { productService } from '@/lib/services/product.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { CreateProductModal } from './components/create-product-modal';
import { EditProductModal } from './components/edit-product-modal';
import { Modal } from './components/modal';
import { ProductsCharts } from './components/products-charts';
import type { IProduct } from '@/lib/types/product';
import type { IAccount } from '@/lib/types/account';
import type { CreateProductFormValues, EditProductFormValues } from './products.schema';

// Helper function to generate a readable name for a product
export function getProductDisplayName(product: {
  detail_product_group: string;
  gender: string;
  color: string;
  size: number;
}) {
  const groupNames: Record<string, string> = {
    SANTD: 'Giày Sneaker SANTD',
    DEPTD: 'Dép xuồng DEPTD',
    GTTPC: 'Giày Thể Thao Phong Cách GTTPC',
    GTTCD: 'Giày Thể Thao Chạy Bộ GTTCD',
    SANTR: 'Sneaker Chạy Bộ SANTR',
    GIATR: 'Giày Tây/Da GIATR',
    PKIEN: 'Phụ Kiện PKIEN',
    TBLTH: 'Thiết Bị Luyện Tập TBLTH',
    TBLTR: 'Thiết Bị Ngoài Trời TBLTR',
  };

  const genderNames: Record<string, string> = {
    MEN: 'Nam',
    WOM: 'Nữ',
    BOY: 'Bé trai',
    GIR: 'Bé gái',
  };

  const group =
    groupNames[product.detail_product_group] || `Sản phẩm ${product.detail_product_group}`;
  const gender = genderNames[product.gender] || product.gender;

  return `${group} ${gender} - Màu ${product.color} - Cỡ ${product.size}`;
}

export default function ProductsPage() {
  // State for data
  const [products, setProducts] = useState<IProduct[]>([]);
  const [currentUser, setCurrentUser] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Search & Filter state
  const [productIdFilter, setProductIdFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [lifestyleFilter, setLifestyleFilter] = useState('ALL');

  // Custom computed name filter
  const [nameFilter, setNameFilter] = useState('');

  // Pagination state (limit is fixed to 30)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Modal control state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    accountService
      .me()
      .then((res) => setCurrentUser(res.data))
      .catch(() => {});
  }, []);

  // Fetch products list
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * 30;
      const res = await productService.list({
        skip,
        limit: 30,
        product_id: productIdFilter.trim() || undefined,
        color: colorFilter.trim() || undefined,
        gender: genderFilter === 'ALL' ? undefined : genderFilter,
        detail_product_group: groupFilter === 'ALL' ? undefined : groupFilter,
        age_group: ageFilter === 'ALL' ? undefined : ageFilter,
        activity_group: activityFilter === 'ALL' ? undefined : activityFilter,
        lifestyle_group: lifestyleFilter === 'ALL' ? undefined : lifestyleFilter,
      });

      setProducts(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 1);
      setTotalProducts(res.data.meta.total || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    productIdFilter,
    colorFilter,
    genderFilter,
    groupFilter,
    ageFilter,
    activityFilter,
    lifestyleFilter,
  ]);

  // Fetch on mount and when filter updates
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Input Changes with Page Reset
  const handleProductIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductIdFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
    // Local filter doesn't reset page as it operates on loaded page, but it's good practice
  };

  // Copy ID Helper
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Đã sao chép mã sản phẩm: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format currency
  const formatCurrency = (val: number | string) => {
    const num = Number(val);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  // Convert DB gender enum back to friendly labels
  const getGenderBadge = (g: string) => {
    switch (g) {
      case 'MEN':
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 font-medium"
          >
            Nam (MEN)
          </Badge>
        );
      case 'WOM':
        return (
          <Badge
            variant="outline"
            className="bg-pink-500/10 text-pink-500 border-pink-500/20 px-2 py-0.5 font-medium"
          >
            Nữ (WOM)
          </Badge>
        );
      case 'BOY':
        return (
          <Badge
            variant="outline"
            className="bg-teal-500/10 text-teal-500 border-teal-500/20 px-2 py-0.5 font-medium"
          >
            Bé trai (BOY)
          </Badge>
        );
      case 'GIR':
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-2 py-0.5 font-medium"
          >
            Bé gái (GIR)
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border px-2 py-0.5 font-medium"
          >
            {g}
          </Badge>
        );
    }
  };

  // Handle create submit
  const handleCreateSubmit = async (data: CreateProductFormValues) => {
    try {
      await productService.create(data);
      toast.success('Thêm sản phẩm mới thành công!');
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi thêm sản phẩm.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (data: EditProductFormValues) => {
    if (!editingProduct) return;

    try {
      await productService.update(editingProduct.product_id, data);
      toast.success('Cập nhật sản phẩm thành công!');
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm.';
      toast.error(errorMsg);
      throw error;
    }
  };

  // Handle delete confirmation action
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsActionLoading(true);
    try {
      await productService.remove(deleteConfirmId);
      toast.success('Đã xóa sản phẩm thành công.');
      setDeleteConfirmId(null);
      fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || 'Không thể xóa sản phẩm.';
      toast.error(errorMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reset Filters
  const handleClearFilters = () => {
    setProductIdFilter('');
    setColorFilter('');
    setGenderFilter('ALL');
    setGroupFilter('ALL');
    setAgeFilter('ALL');
    setActivityFilter('ALL');
    setLifestyleFilter('ALL');
    setNameFilter('');
    setCurrentPage(1);
    toast.success('Đã xóa tất cả bộ lọc');
  };

  // Apply name search filtering locally on the loaded batch of products
  const filteredProducts = React.useMemo(() => {
    if (!nameFilter.trim()) return products;
    const searchLower = nameFilter.trim().toLowerCase();
    return products.filter((p) => {
      const name = getProductDisplayName(p).toLowerCase();
      return name.includes(searchLower);
    });
  }, [products, nameFilter]);

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-8 text-blue-500" />
            Quản lý sản phẩm
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Xem danh sách, thêm, chỉnh sửa hoặc xóa sản phẩm trong hệ thống (Tối đa 30 sản
            phẩm/trang).
          </p>
        </div>
        <Button
          disabled={!isAdmin}
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm sản phẩm' : undefined}
        >
          <Plus className="size-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm font-medium">
                Tổng sản phẩm khớp bộ lọc
              </span>
              <p className="text-3xl font-bold text-foreground">
                {totalProducts.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Package className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm font-medium">Giới hạn phân trang</span>
              <p className="text-3xl font-bold text-foreground">30</p>
            </div>
            <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Layers className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm font-medium">Vai trò tài khoản</span>
              <p className="text-xl font-bold text-foreground flex items-center gap-1.5 mt-1">
                {currentUser ? (
                  isAdmin ? (
                    <Badge className="bg-blue-600 text-white border-transparent px-2 py-0.5">
                      ADMIN (Toàn quyền)
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-2 py-0.5"
                    >
                      STAFF (Chỉ xem)
                    </Badge>
                  )
                ) : (
                  'Đang tải...'
                )}
              </p>
            </div>
            <div className="size-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ShieldAlert className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Section */}
      <ProductsCharts products={filteredProducts} />

      {/* Advanced Filters Card */}
      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <Settings2 className="size-4 text-blue-500" />
            Bộ lọc & Tìm kiếm sản phẩm
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Combined Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-amber-500" />
                Tìm theo Tên sản phẩm (màu sắc, loại, size...)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Ví dụ: Giày Sneaker SANTD Màu Đen..."
                  value={nameFilter}
                  onChange={handleNameFilterChange}
                  className="pl-9 bg-muted/20 border-border"
                />
              </div>
            </div>

            {/* Search ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Mã sản phẩm (DB)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Ví dụ: SP1712..."
                  value={productIdFilter}
                  onChange={handleProductIdChange}
                  className="pl-9 bg-muted/20 border-border"
                />
              </div>
            </div>

            {/* Search Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Màu sắc (DB)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập màu sắc..."
                  value={colorFilter}
                  onChange={handleColorChange}
                  className="pl-9 bg-muted/20 border-border"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
            {/* Gender Filter */}
            <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">Giới tính</label>
              <Select
                value={genderFilter}
                onValueChange={(v) => {
                  setGenderFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                  <SelectValue placeholder="Tất cả giới tính" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">Tất cả giới tính</SelectItem>
                  <SelectItem value="MEN">Nam (MEN)</SelectItem>
                  <SelectItem value="WOM">Nữ (WOM)</SelectItem>
                  <SelectItem value="BOY">Bé trai (BOY)</SelectItem>
                  <SelectItem value="GIR">Bé gái (GIR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Nhóm sản phẩm</label>
              <Select
                value={groupFilter}
                onValueChange={(v) => {
                  setGroupFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                  <SelectValue placeholder="Tất cả nhóm" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">Tất cả nhóm</SelectItem>
                  <SelectItem value="SANTD">SANTD</SelectItem>
                  <SelectItem value="DEPTD">DEPTD</SelectItem>
                  <SelectItem value="GTTPC">GTTPC</SelectItem>
                  <SelectItem value="GTTCD">GTTCD</SelectItem>
                  <SelectItem value="SANTR">SANTR</SelectItem>
                  <SelectItem value="GIATR">GIATR</SelectItem>
                  <SelectItem value="PKIEN">PKIEN</SelectItem>
                  <SelectItem value="TBLTH">TBLTH</SelectItem>
                  <SelectItem value="TBLTR">TBLTR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Group */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Độ tuổi</label>
              <Select
                value={ageFilter}
                onValueChange={(v) => {
                  setAgeFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                  <SelectValue placeholder="Tất cả độ tuổi" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">Tất cả độ tuổi</SelectItem>
                  <SelectItem value="0 đến <3 tuổi">0 đến &lt;3 tuổi</SelectItem>
                  <SelectItem value="3 đến <6 tuổi">3 đến &lt;6 tuổi</SelectItem>
                  <SelectItem value="6 đến <10 tuổi">6 đến &lt;10 tuổi</SelectItem>
                  <SelectItem value="10 đến <16 tuổi">10 đến &lt;16 tuổi</SelectItem>
                  <SelectItem value="16 đến <24 tuổi">16 đến &lt;24 tuổi</SelectItem>
                  <SelectItem value="24 đến <40 tuổi">24 đến &lt;40 tuổi</SelectItem>
                  <SelectItem value="40 đến <60 tuổi">40 đến &lt;60 tuổi</SelectItem>
                  <SelectItem value="Trên 60 tuổi">Trên 60 tuổi</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Group */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Hoạt động</label>
              <Select
                value={activityFilter}
                onValueChange={(v) => {
                  setActivityFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                  <SelectValue placeholder="Tất cả hoạt động" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">Tất cả hoạt động</SelectItem>
                  <SelectItem value="Thường nhật/Trường học">Thường nhật/Trường học</SelectItem>
                  <SelectItem value="Thể thao">Thể thao</SelectItem>
                  <SelectItem value="Văn phòng">Văn phòng</SelectItem>
                  <SelectItem value="Chuyên biệt">Chuyên biệt</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lifestyle Group */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phong cách sống</label>
              <Select
                value={lifestyleFilter}
                onValueChange={(v) => {
                  setLifestyleFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl">
                  <SelectValue placeholder="Tất cả phong cách" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">Tất cả phong cách</SelectItem>
                  <SelectItem value="Sport">Sport</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(productIdFilter ||
            colorFilter ||
            genderFilter !== 'ALL' ||
            groupFilter !== 'ALL' ||
            ageFilter !== 'ALL' ||
            activityFilter !== 'ALL' ||
            lifestyleFilter !== 'ALL' ||
            nameFilter) && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="h-9 px-4 border-border text-muted-foreground hover:text-foreground cursor-pointer text-xs"
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table / Grid */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-sm text-muted-foreground">Đang tải danh sách sản phẩm...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
            <Package className="size-12 text-muted-foreground opacity-40" />
            <p className="text-foreground font-semibold text-base">Không tìm thấy sản phẩm nào</p>
            <p className="text-muted-foreground text-sm">
              Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      <th className="px-5 py-4 w-[160px]">Mã sản phẩm</th>
                      <th className="px-5 py-4 min-w-[280px]">Tên sản phẩm</th>
                      <th className="px-5 py-4 w-[120px]">Giới tính</th>
                      <th className="px-5 py-4 w-[130px]">Giá vốn</th>
                      <th className="px-5 py-4 w-[130px]">Giá bán lẻ</th>
                      <th className="px-5 py-4 min-w-[200px]">Độ tuổi / Hoạt động / Phong cách</th>
                      <th className="px-5 py-4 text-right w-[100px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm text-foreground">
                    {filteredProducts.map((product) => (
                      <tr key={product.product_id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-muted-foreground font-bold">
                              {product.product_id}
                            </span>
                            <button
                              onClick={() => handleCopyId(product.product_id)}
                              className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer animate-fade-in"
                              title="Sao chép mã sản phẩm"
                            >
                              {copiedId === product.product_id ? (
                                <Check className="size-3 text-green-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-foreground">
                          {getProductDisplayName(product)}
                        </td>
                        <td className="px-5 py-4">{getGenderBadge(product.gender)}</td>
                        <td className="px-5 py-4 font-mono font-medium text-amber-600 dark:text-amber-500">
                          {formatCurrency(product.price_cost)}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-500">
                          {formatCurrency(product.listing_price)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                            <span className="bg-muted px-1.5 py-0.5 rounded-sm">
                              {product.age_group}
                            </span>
                            <span className="bg-muted px-1.5 py-0.5 rounded-sm">
                              {product.activity_group}
                            </span>
                            <span className="bg-muted px-1.5 py-0.5 rounded-sm">
                              {product.lifestyle_group}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!isAdmin}
                              onClick={() => {
                                setEditingProduct(product);
                                setIsEditOpen(true);
                              }}
                              className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                !isAdmin ? 'Chỉ Quản trị viên mới có quyền chỉnh sửa' : 'Chỉnh sửa'
                              }
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!isAdmin}
                              onClick={() => setDeleteConfirmId(product.product_id)}
                              className="size-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={!isAdmin ? 'Chỉ Quản trị viên mới có quyền xóa' : 'Xóa'}
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
            </div>

            {/* Mobile View: Cards Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
              {filteredProducts.map((product) => (
                <Card key={product.product_id} className="bg-card border-border shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          {product.product_id.substring(0, 15)}...
                        </span>
                        <button
                          onClick={() => handleCopyId(product.product_id)}
                          className="p-1 hover:bg-muted rounded-md text-muted-foreground cursor-pointer"
                        >
                          {copiedId === product.product_id ? (
                            <Check className="size-3 text-green-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50/5 text-blue-400 border-blue-500/20 text-xs"
                      >
                        {product.detail_product_group}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">Tên sản phẩm</span>
                      <span className="font-semibold text-sm leading-tight block">
                        {getProductDisplayName(product)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">
                          Giới tính
                        </span>
                        <div className="mt-0.5">{getGenderBadge(product.gender)}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">
                          Kích cỡ (Size)
                        </span>
                        <Badge variant="secondary" className="font-bold text-xs bg-muted mt-0.5">
                          {product.size}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-dashed border-border pt-2">
                      <div>
                        <span className="text-xs text-muted-foreground block">Giá vốn</span>
                        <span className="font-mono text-xs font-medium text-amber-600 dark:text-amber-500">
                          {formatCurrency(product.price_cost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Giá bán lẻ</span>
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-500">
                          {formatCurrency(product.listing_price)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-2 rounded-lg text-[10px] text-muted-foreground flex flex-wrap gap-1">
                      <span className="bg-background px-1.5 py-0.5 rounded-sm">
                        {product.age_group}
                      </span>
                      <span className="bg-background px-1.5 py-0.5 rounded-sm">
                        {product.activity_group}
                      </span>
                      <span className="bg-background px-1.5 py-0.5 rounded-sm">
                        {product.lifestyle_group}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isAdmin}
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditOpen(true);
                        }}
                        className="h-8 text-xs border-border text-muted-foreground hover:text-blue-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Edit className="size-3.5 mr-1" /> Chỉnh sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isAdmin}
                        onClick={() => setDeleteConfirmId(product.product_id)}
                        className="h-8 text-xs border-border text-muted-foreground hover:text-red-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-3.5 mr-1" /> Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Hiển thị trang <strong className="text-foreground">{currentPage}</strong> trên{' '}
                <strong className="text-foreground">{totalPages}</strong> (Tổng cộng{' '}
                <strong className="text-foreground">{totalProducts.toLocaleString('vi-VN')}</strong>{' '}
                sản phẩm)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline ml-1 text-xs">Trước</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || isLoading}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="border-border text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <span className="hidden sm:inline mr-1 text-xs">Sau</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Xác nhận xóa sản phẩm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
            <ShieldAlert className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Hành động này không thể hoàn tác!</p>
              <p className="text-xs text-red-400 mt-1">
                Bạn có chắc chắn muốn xóa sản phẩm có mã <strong>{deleteConfirmId}</strong> khỏi hệ
                thống?
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isActionLoading}
              onClick={() => setDeleteConfirmId(null)}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isActionLoading}
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg hover:shadow-red-500/10 cursor-pointer"
            >
              {isActionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
