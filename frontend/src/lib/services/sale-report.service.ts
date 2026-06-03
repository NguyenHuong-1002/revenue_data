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
  customer_id: string;
  sold_quantity: number;
  distribution_channel: 'Online' | 'Bán lẻ' | 'Phát sinh' | 'Bán sỉ' | 'Siêu thị' | 'Hợp đồng' | 'Chi nhánh';
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

  getStats() {
    return api.get<{
      distribution_channel: { name: string; count: number }[];
      monthly_sales: { name: string; count: number }[];
      top_branches: { name: string; count: number }[];
    }>('/sale-reports/stats');
  },
};
