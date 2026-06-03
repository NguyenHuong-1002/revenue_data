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
