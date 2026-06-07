import api from '@/lib/axios';

export interface SaleReportQueryDto {
  skip?: number;
  limit?: number;
  product_id?: string;
  branch_id?: string;
  distribution_channel?: string;
  fromMonth?: string;
  toMonth?: string;
}

export interface ISaleReport {
  sale_id: string;
  product_id: string;
  sold_quantity: number;
  distribution_channel:
    | 'Online'
    | 'Bán lẻ'
    | 'Phát sinh'
    | 'Bán sỉ'
    | 'Siêu thị'
    | 'Hợp đồng'
    | 'Chi nhánh';
  branch_id: string;
  time_report: string;
  created_at: string;
  updated_at: string;
}

export interface IPaginatedSaleReports {
  data: ISaleReport[];
  meta: {
    skip: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IHighlightProduct {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  detail_product_group: string;
  gender: string;
  color: string;
  size: number;
  qty1?: number;
  qty2?: number;
  qtyDiff?: number;
  growthPercent?: number;
}

export const saleReportService = {
  list(params?: SaleReportQueryDto) {
    return api.get<IPaginatedSaleReports>('/sale-reports', { params });
  },

  get(id: string) {
    return api.get<ISaleReport>(`/sale-reports/${id}`);
  },

  create(data: Partial<ISaleReport>) {
    return api.post<ISaleReport>('/sale-reports', data);
  },

  update(id: string, data: Partial<ISaleReport>) {
    return api.put<ISaleReport>(`/sale-reports/${id}`, data);
  },

  delete(id: string) {
    return api.delete<boolean>(`/sale-reports/${id}`);
  },

  getStats(range?: string) {
    return api.get<{
      distribution_channel: { name: string; count: number }[];
      monthly_sales: { name: string; count: number }[];
      top_branches: { name: string; count: number }[];
    }>('/sale-reports/stats', { params: { range } });
  },

  getRevenueStats(range?: string) {
    return api.get<{
      totalRevenue: number;
      growthRate: number;
      topProductByRevenue: {
        id: string;
        name: string;
        revenue: number;
        detail_product_group: string;
        gender: string;
        color: string;
        size: number;
      };
      topProductByQuantity: {
        id: string;
        name: string;
        quantity: number;
        detail_product_group: string;
        gender: string;
        color: string;
        size: number;
      };
    }>('/sale-reports/revenue-stats', { params: { range } });
  },

  getHighlightProductsStats(range?: string) {
    return api.get<{
      topRevenue: IHighlightProduct[];
      bottomRevenue: IHighlightProduct[];
      topQuantity: IHighlightProduct[];
      bottomQuantity: IHighlightProduct[];
      topGrowth: IHighlightProduct[];
      bottomGrowth: IHighlightProduct[];
    }>('/sale-reports/highlight-products-stats', { params: { range } });
  },
};
