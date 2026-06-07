'use client';

import { Copy, Check, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface ProductsCardsProps {
  products: IProduct[];
  isAdmin: boolean;
  onEdit: (product: IProduct) => void;
  onDelete: (id: string) => void;
  onCopyId: (id: string) => void;
  copiedId: string | null;
}

export function ProductsCards({
  products,
  isAdmin,
  onEdit,
  onDelete,
  onCopyId,
  copiedId,
}: ProductsCardsProps) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
      {products.map((product) => (
        <Card key={product.product_id} className="bg-card border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {product.product_id.substring(0, 15)}...
                </span>
                <button
                  onClick={() => onCopyId(product.product_id)}
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
                <span className="text-xs text-muted-foreground block font-medium">Giới tính</span>
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
              <span className="bg-background px-1.5 py-0.5 rounded-sm">{product.age_group}</span>
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
                onClick={() => onEdit(product)}
                className="h-8 text-xs border-border text-muted-foreground hover:text-blue-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Edit className="size-3.5 mr-1" /> Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!isAdmin}
                onClick={() => onDelete(product.product_id)}
                className="h-8 text-xs border-border text-muted-foreground hover:text-red-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="size-3.5 mr-1" /> Xóa
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
