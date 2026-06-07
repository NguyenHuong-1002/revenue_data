import { ProductInfo } from './types';

export function getProductDisplayName(product: Partial<ProductInfo>) {
  if (!product.detail_product_group) return 'Đang cập nhật...';

  const groupNames: Record<string, string> = {
    SANTD: 'Sneaker SANTD',
    DEPTD: 'Dép xuồng DEPTD',
    GTTPC: 'Giày Thể Thao GTTPC',
    GTTCD: 'Giày Thể Thao GTTCD',
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
  const gender = genderNames[product.gender || ''] || product.gender;

  return `${group} ${gender} (${product.color}, Cỡ ${product.size})`;
}

export function getChannelColor(name: string) {
  const colors: Record<string, string> = {
    Online: 'hsl(217.2, 91.2%, 59.8%)',
    'Bán lẻ': 'hsl(346.8, 77.2%, 49.8%)',
    'Phát sinh': 'hsl(173.4, 80.4%, 40%)',
    'Bán sỉ': 'hsl(262.1, 83.3%, 57.8%)',
    'Siêu thị': 'hsl(47.9, 95.8%, 53.1%)',
    'Hợp đồng': 'hsl(25, 95%, 53%)',
    'Chi nhánh': 'hsl(142.1, 76.2%, 36.3%)',
    'Đổi trả / Hoàn hàng': 'hsl(0, 84.2%, 60.2%)',
  };
  return colors[name] || 'var(--primary)';
}
