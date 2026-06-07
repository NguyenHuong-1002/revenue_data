'use client';

import { Copy, Check, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IProduct } from '@/lib/types/product';

// Helper function to generate a readable name for a product
function getProductDisplayName(product: {
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

interface ProductsTableProps {
  products: IProduct[];
  isAdmin: boolean;
  onEdit: (product: IProduct) => void;
  onDelete: (id: string) => void;
  onCopyId: (id: string) => void;
  copiedId: string | null;
}

export function ProductsTable({
  products,
  isAdmin,
  onEdit,
  onDelete,
  onCopyId,
  copiedId,
}: ProductsTableProps) {
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
        return <p className="px-2 py-0.5 font-medium">Nam</p>;
      case 'WOM':
        return <p className="px-2 py-0.5 font-medium">Nữ</p>;
      case 'BOY':
        return <p className="px-2 py-0.5 font-medium">Bé nam</p>;
      case 'GIR':
        return (
          // <Badge
          //   variant="outline"
          //   className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-2 py-0.5 font-medium"
          // >

          // </Badge>
          <p className="px-2 py-0.5 font-medium">Bé nữ</p>
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

  return (
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
            {products.map((product) => (
              <tr key={product.product_id} className="hover:bg-muted/10 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-muted-foreground font-bold">
                      {product.product_id}
                    </span>
                    <button
                      onClick={() => onCopyId(product.product_id)}
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
                <td className="px-5 py-4 font-mono font-medium text-black dark:text-white">
                  {formatCurrency(product.price_cost)}
                </td>
                <td className="px-5 py-4 font-mono font-bold text-gray-700 dark:text-gray-400">
                  {formatCurrency(product.listing_price)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                    <span className="bg-muted px-1.5 py-0.5 rounded-sm">{product.age_group}</span>
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
                      onClick={() => onEdit(product)}
                      className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={!isAdmin ? 'Chỉ Quản trị viên mới có quyền chỉnh sửa' : 'Chỉnh sửa'}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!isAdmin}
                      onClick={() => onDelete(product.product_id)}
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
  );
}
