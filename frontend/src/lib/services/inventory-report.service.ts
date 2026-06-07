import api from '@/lib/axios';

export interface InventoryReportQueryDto {
  skip?: number;
  limit?: number;
  product_id?: string;
  plant_id?: string;
  fromMonth?: string;
  toMonth?: string;
}

export interface IInventoryReport {
  inventory_id: string;
  product_id: string;
  plant_id: string;
  calendar_year_week: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface IPaginatedInventoryReports {
  data: IInventoryReport[];
  meta: {
    skip: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const inventoryReportService = {
  list(params?: InventoryReportQueryDto) {
    return api.get<IPaginatedInventoryReports>('/inventory-reports', { params });
  },

  get(id: string) {
    return api.get<IInventoryReport>(`/inventory-reports/${id}`);
  },

  create(data: Partial<IInventoryReport>) {
    return api.post<IInventoryReport>('/inventory-reports', data);
  },

  update(id: string, data: Partial<IInventoryReport>) {
    return api.put<IInventoryReport>(`/inventory-reports/${id}`, data);
  },

  delete(id: string) {
    return api.delete<boolean>(`/inventory-reports/${id}`);
  },

  getStats() {
    return api.get<{
      plant_inventory: { name: string; count: number }[];
      monthly_inventory: { name: string; count: number }[];
    }>('/inventory-reports/stats');
  },

  getKpis(params?: { fromDate?: string; toDate?: string }) {
    return api.get<{
      totalStock: number;
      totalRecords: number;
      totalPlants: number;
      totalProducts: number;
      currentMonthStock: number;
      previousMonthStock: number;
      growthPercent: number | null;
      topPlant: { plant_id: string; total: number } | null;
      topProduct: { product_id: string; total: number } | null;
      avgStockPerPlant: number;
    }>('/inventory-reports/kpis', { params });
  },

  getRankings(topN = 10, params?: { fromDate?: string; toDate?: string }) {
    return api.get<{
      topStocked: { product_id: string; total: number }[];
      bottomStocked: { product_id: string; total: number }[];
      topPlants: { plant_id: string; total: number; record_count: number }[];
      monthlyTrend: { month: string; total: number; growthPct: number | null }[];
    }>('/inventory-reports/rankings', { params: { topN, ...params } });
  },

  getAlerts(
    lowThreshold = 50,
    highThreshold = 10000,
    params?: { fromDate?: string; toDate?: string }
  ) {
    return api.get<{
      lowStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
      highStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
      totalAlerts: number;
    }>('/inventory-reports/alerts', { params: { lowThreshold, highThreshold, ...params } });
  },
};
