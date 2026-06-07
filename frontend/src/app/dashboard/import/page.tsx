'use client';

import * as React from 'react';
import { FolderOpen, ShoppingBag, Boxes } from 'lucide-react';
import { importService } from '@/lib/services/import.service';
import { ImportHeader } from './components/import-header';
import { ImportGuide } from './components/import-guide';
import { ImportCard } from './components/import-card';
import { cn } from '@/lib/utils';

export default function ImportPage() {
  const [activeTab, setActiveTab] = React.useState<'products' | 'sales' | 'inventory'>('products');

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <ImportHeader />

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-border/60 gap-2 overflow-x-auto scrollbar-none">
        {(
          [
            { key: 'products', label: 'Sản phẩm (Products)', icon: FolderOpen },
            { key: 'sales', label: 'Doanh số (Sales)', icon: ShoppingBag },
            { key: 'inventory', label: 'Tồn kho (Inventory)', icon: Boxes },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 text-sm font-semibold relative transition-all px-4 py-2.5 rounded-t-lg cursor-pointer flex items-center gap-2 outline-none',
                activeTab === tab.key
                  ? 'text-indigo-600 font-bold dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Upload Container ── */}
      <div className="flex flex-col gap-6">
        {/* Card 1: Sản phẩm */}
        {activeTab === 'products' && (
          <ImportCard
            title="Danh mục sản phẩm (Products)"
            description="Nhập hàng loạt sản phẩm mới hoặc cập nhật giá bán, màu sắc, kích cỡ."
            icon={<FolderOpen className="h-5 w-5 text-indigo-500" />}
            sampleData={{
              headers: [
                'product_id',
                'color',
                'listing_price',
                'price_cost',
                'gender',
                'size',
                'detail_product_group',
                'age_group',
                'activity_group',
                'lifestyle_group',
              ],
              rows: [
                {
                  status: 'valid',
                  data: {
                    product_id: 'PROD-001',
                    color: 'Red',
                    listing_price: 299000,
                    price_cost: 150000,
                    gender: 'Men',
                    size: 'M',
                    detail_product_group: 'T-Shirt',
                    age_group: 'Adult',
                    activity_group: 'Running',
                    lifestyle_group: 'Sports',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    product_id: '',
                    color: 'Blue',
                    listing_price: 'abc',
                    price_cost: 100000,
                    gender: 'Women',
                    size: 'L',
                    detail_product_group: 'Pants',
                    age_group: 'Kids',
                    activity_group: 'Casual',
                    lifestyle_group: 'Street',
                  },
                  note: 'Lỗi: Thiếu product_id; Giá bán không phải số (abc)',
                },
                {
                  status: 'valid',
                  data: {
                    product_id: 'PROD-002',
                    color: 'Black',
                    listing_price: 399000,
                    price_cost: 200000,
                    gender: 'Women',
                    size: 'S',
                    detail_product_group: 'Dress',
                    age_group: 'Adult',
                    activity_group: 'None',
                    lifestyle_group: 'Casual',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'valid',
                  data: {
                    product_id: 'PROD-003',
                    color: 'White',
                    listing_price: 199000,
                    price_cost: 90000,
                    gender: 'Unisex',
                    size: 'XL',
                    detail_product_group: 'Socks',
                    age_group: 'All',
                    activity_group: 'Training',
                    lifestyle_group: 'Active',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    product_id: 'PROD-004',
                    color: 'Green',
                    listing_price: 450000,
                    price_cost: '',
                    gender: 'Men',
                    size: 'L',
                    detail_product_group: 'Jacket',
                    age_group: 'Adult',
                    activity_group: 'Hiking',
                    lifestyle_group: 'Outdoor',
                  },
                  note: 'Lỗi: Thiếu chi phí giá vốn (price_cost)',
                },
                {
                  status: 'valid',
                  data: {
                    product_id: 'PROD-005',
                    color: 'Gray',
                    listing_price: 599000,
                    price_cost: 300000,
                    gender: 'Men',
                    size: '32',
                    detail_product_group: 'Jeans',
                    age_group: 'Adult',
                    activity_group: 'None',
                    lifestyle_group: 'Casual',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'valid',
                  data: {
                    product_id: 'PROD-006',
                    color: 'Pink',
                    listing_price: 350000,
                    price_cost: 170000,
                    gender: 'Women',
                    size: 'XS',
                    detail_product_group: 'Skirt',
                    age_group: 'Adult',
                    activity_group: 'Tennis',
                    lifestyle_group: 'Sports',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    product_id: 'PROD-007',
                    color: 'Yellow',
                    listing_price: -50000,
                    price_cost: 40000,
                    gender: 'Unisex',
                    size: 'M',
                    detail_product_group: 'Cap',
                    age_group: 'Kids',
                    activity_group: 'Golf',
                    lifestyle_group: 'Active',
                  },
                  note: 'Lỗi: Giá bán không được âm (-50000)',
                },
              ],
            }}
            uploadFn={(file) => importService.importProducts(file)}
            successMessage="Nhập dữ liệu Sản phẩm thành công!"
            colorTheme={{
              hoverBorder: 'hover:border-indigo-500/60',
              iconBg: 'bg-indigo-500/10 text-indigo-500',
              buttonBg: 'bg-indigo-600 hover:bg-indigo-700',
              infoIconText: 'text-indigo-500',
              statusText: 'text-indigo-600 dark:text-indigo-400',
            }}
          />
        )}

        {/* Card 2: Báo cáo doanh số */}
        {activeTab === 'sales' && (
          <ImportCard
            title="Báo cáo doanh số (Sales)"
            description="Nhập báo cáo doanh số bán lẻ, số lượng bán ra theo chi nhánh."
            icon={<ShoppingBag className="h-5 w-5 text-emerald-500" />}
            sampleData={{
              headers: [
                'sale_id',
                'product_id',
                'sold_quantity',
                'distribution_channel',
                'branch_id',
                'time_report',
              ],
              rows: [
                {
                  status: 'valid',
                  data: {
                    sale_id: 'SALE-1001',
                    product_id: 'PROD-001',
                    sold_quantity: 5,
                    distribution_channel: 'Online',
                    branch_id: 'BR-01',
                    time_report: '2026-06-01',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    sale_id: 'SALE-1002',
                    product_id: 'PROD-999',
                    sold_quantity: -2,
                    distribution_channel: 'Store',
                    branch_id: 'BR-02',
                    time_report: '01/13/2026',
                  },
                  note: 'Lỗi: Số lượng âm (-2); Sai định dạng ngày YYYY-MM-DD (01/13/2026)',
                },
                {
                  status: 'valid',
                  data: {
                    sale_id: 'SALE-1003',
                    product_id: 'PROD-002',
                    sold_quantity: 12,
                    distribution_channel: 'Store',
                    branch_id: 'BR-01',
                    time_report: '2026-06-01',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'valid',
                  data: {
                    sale_id: 'SALE-1004',
                    product_id: 'PROD-003',
                    sold_quantity: 1,
                    distribution_channel: 'Online',
                    branch_id: 'BR-03',
                    time_report: '2026-06-02',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    sale_id: '',
                    product_id: 'PROD-004',
                    sold_quantity: 10,
                    distribution_channel: 'Online',
                    branch_id: 'BR-01',
                    time_report: '2026-06-02',
                  },
                  note: 'Lỗi: Thiếu sale_id (Khóa chính bắt buộc)',
                },
                {
                  status: 'valid',
                  data: {
                    sale_id: 'SALE-1005',
                    product_id: 'PROD-005',
                    sold_quantity: 3,
                    distribution_channel: 'Store',
                    branch_id: 'BR-02',
                    time_report: '2026-06-03',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'valid',
                  data: {
                    sale_id: 'SALE-1006',
                    product_id: 'PROD-006',
                    sold_quantity: 8,
                    distribution_channel: 'Online',
                    branch_id: 'BR-02',
                    time_report: '2026-06-03',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    sale_id: 'SALE-1007',
                    product_id: 'PROD-007',
                    sold_quantity: 'abc',
                    distribution_channel: 'Store',
                    branch_id: 'BR-01',
                    time_report: '2026-06-04',
                  },
                  note: 'Lỗi: Số lượng bán không phải số (abc)',
                },
              ],
            }}
            uploadFn={(file) => importService.importSales(file)}
            successMessage="Nhập dữ liệu Doanh số thành công!"
            colorTheme={{
              hoverBorder: 'hover:border-emerald-500/60',
              iconBg: 'bg-emerald-500/10 text-emerald-500',
              buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
              infoIconText: 'text-emerald-500',
              statusText: 'text-emerald-600 dark:text-emerald-400',
            }}
          />
        )}

        {/* Card 3: Báo cáo tồn kho */}
        {activeTab === 'inventory' && (
          <ImportCard
            title="Báo cáo tồn kho (Inventory)"
            description="Nhập báo cáo lượng tồn kho thực tế ở các kho hàng / nhà máy."
            icon={<Boxes className="h-5 w-5 text-purple-500" />}
            sampleData={{
              headers: [
                'inventory_id',
                'product_id',
                'plant_id',
                'calendar_year_week',
                'quantity',
                'time_report',
              ],
              rows: [
                {
                  status: 'valid',
                  data: {
                    inventory_id: 'INV-201',
                    product_id: 'PROD-001',
                    plant_id: 'PL-09',
                    calendar_year_week: '2026-W23',
                    quantity: 120,
                    time_report: '2026-06-01',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    inventory_id: 'INV-202',
                    product_id: '',
                    plant_id: 'PL-09',
                    calendar_year_week: '2026-23',
                    quantity: 'abc',
                    time_report: '2026-06-01',
                  },
                  note: 'Lỗi: Thiếu product_id; Sai định dạng tuần YYYY-Www; Số lượng không phải số (abc)',
                },
                {
                  status: 'valid',
                  data: {
                    inventory_id: 'INV-203',
                    product_id: 'PROD-002',
                    plant_id: 'PL-01',
                    calendar_year_week: '2026-W23',
                    quantity: 450,
                    time_report: '2026-06-01',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'valid',
                  data: {
                    inventory_id: 'INV-204',
                    product_id: 'PROD-003',
                    plant_id: 'PL-02',
                    calendar_year_week: '2026-W23',
                    quantity: 75,
                    time_report: '2026-06-02',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    inventory_id: 'INV-205',
                    product_id: 'PROD-004',
                    plant_id: '',
                    calendar_year_week: '2026-W23',
                    quantity: 300,
                    time_report: '2026-06-02',
                  },
                  note: 'Lỗi: Thiếu plant_id (Nhà máy)',
                },
                {
                  status: 'valid',
                  data: {
                    inventory_id: 'INV-206',
                    product_id: 'PROD-005',
                    plant_id: 'PL-01',
                    calendar_year_week: '2026-W24',
                    quantity: 50,
                    time_report: '2026-06-08',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'valid',
                  data: {
                    inventory_id: 'INV-207',
                    product_id: 'PROD-006',
                    plant_id: 'PL-02',
                    calendar_year_week: '2026-W24',
                    quantity: 90,
                    time_report: '2026-06-08',
                  },
                  note: 'Đầy đủ thông tin hợp lệ',
                },
                {
                  status: 'invalid',
                  data: {
                    inventory_id: 'INV-208',
                    product_id: 'PROD-007',
                    plant_id: 'PL-01',
                    calendar_year_week: '2026-W24',
                    quantity: -15,
                    time_report: '2026-06-09',
                  },
                  note: 'Lỗi: Số lượng tồn kho không được âm (-15)',
                },
              ],
            }}
            uploadFn={(file) => importService.importInventory(file)}
            successMessage="Nhập dữ liệu Tồn kho thành công!"
            colorTheme={{
              hoverBorder: 'hover:border-purple-500/60',
              iconBg: 'bg-purple-500/10 text-purple-500',
              buttonBg: 'bg-purple-600 hover:bg-purple-700',
              infoIconText: 'text-purple-500',
              statusText: 'text-purple-600 dark:text-purple-400',
            }}
          />
        )}
      </div>

      {/* ── Guide ── */}
      <ImportGuide />
    </div>
  );
}
