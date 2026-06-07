'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package } from 'lucide-react';
import { productService } from '@/lib/services/product.service';
import { accountService } from '@/lib/services/account.service';
import { toast } from 'sonner';
import { CreateProductModal } from './components/create-product-modal';
import { EditProductModal } from './components/edit-product-modal';
import { ProductsCharts } from './components/products-charts';
import { DashboardHeader } from '@/components/dashboard-header';
import { ProductsStats } from './components/products-stats';
import { ProductsFilter } from './components/products-filter';
import { ProductsTable } from './components/products-table';
import { ProductsCards } from './components/products-cards';
import { ProductsPagination } from './components/products-pagination';
import { DeleteProductModal } from './components/delete-product-modal';
import { ProductsSkeleton, ProductsFilterSkeleton } from './components/products-skeleton';
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
      <DashboardHeader
        title="Quản lý sản phẩm"
        description="Xem danh sách, thêm, chỉnh sửa hoặc xóa sản phẩm trong hệ thống (Tối đa 30 sản phẩm/trang)."
        buttonText="Thêm sản phẩm"
        onButtonClick={() => setIsCreateOpen(true)}
        isButtonDisabled={!isAdmin}
        buttonTooltip={!isAdmin ? 'Chỉ Quản trị viên mới có quyền thêm sản phẩm' : undefined}
        icon={Package}
      />

      {/* Summary stats */}
      <ProductsStats totalProducts={totalProducts} isLoading={isLoading} />

      {/* Visual Analytics Section */}
      <ProductsCharts />

      {/* Advanced Filters Card */}
      {isLoading && products.length === 0 ? (
        <ProductsFilterSkeleton />
      ) : (
        <ProductsFilter
          productIdFilter={productIdFilter}
          colorFilter={colorFilter}
          genderFilter={genderFilter}
          groupFilter={groupFilter}
          ageFilter={ageFilter}
          activityFilter={activityFilter}
          lifestyleFilter={lifestyleFilter}
          nameFilter={nameFilter}
          onProductIdFilterChange={(val) => {
            setProductIdFilter(val);
            setCurrentPage(1);
          }}
          onColorFilterChange={(val) => {
            setColorFilter(val);
            setCurrentPage(1);
          }}
          onGenderFilterChange={(val) => {
            setGenderFilter(val);
            setCurrentPage(1);
          }}
          onGroupFilterChange={(val) => {
            setGroupFilter(val);
            setCurrentPage(1);
          }}
          onAgeFilterChange={(val) => {
            setAgeFilter(val);
            setCurrentPage(1);
          }}
          onActivityFilterChange={(val) => {
            setActivityFilter(val);
            setCurrentPage(1);
          }}
          onLifestyleFilterChange={(val) => {
            setLifestyleFilter(val);
            setCurrentPage(1);
          }}
          onNameFilterChange={(val) => {
            setNameFilter(val);
          }}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Main Table / Grid */}
      <div className="w-full">
        {isLoading ? (
          <ProductsSkeleton />
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
            <ProductsTable
              products={filteredProducts}
              isAdmin={isAdmin}
              onEdit={(product) => {
                setEditingProduct(product);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
              onCopyId={handleCopyId}
              copiedId={copiedId}
            />

            {/* Mobile View: Cards Layout */}
            <ProductsCards
              products={filteredProducts}
              isAdmin={isAdmin}
              onEdit={(product) => {
                setEditingProduct(product);
                setIsEditOpen(true);
              }}
              onDelete={(id) => setDeleteConfirmId(id)}
              onCopyId={handleCopyId}
              copiedId={copiedId}
            />

            {/* Pagination Controls */}
            <ProductsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalProducts={totalProducts}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
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
      <DeleteProductModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isActionLoading}
        productId={deleteConfirmId}
      />
    </div>
  );
}
