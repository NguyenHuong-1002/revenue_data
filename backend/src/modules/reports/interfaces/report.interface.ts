export interface IMonthlyRevenuePoint {
  month: string;
  revenue: number;
  quantity: number;
}

export interface ITopProductRevenue {
  product_id: string;
  product_name: string;
  quantity: number;
  revenue: number;
}

export interface ITopBranchRevenue {
  branch_id: string;
  branch_name: string;
  quantity: number;
  revenue: number;
}

export interface IGrowthReportData {
  period: {
    from: string | null;
    to: string | null;
  };
  summary: {
    totalRevenue: number;
    totalQuantity: number;
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    growthPercent: number | null;
    averageMonthlyRevenue: number;
    averageMonthlyQuantity: number;
  };
  monthly: IMonthlyRevenuePoint[];
  highlights: {
    topProduct: ITopProductRevenue | null;
    topBranch: ITopBranchRevenue | null;
  };
}

export interface IRevenueReportData extends IGrowthReportData {
  topProducts: ITopProductRevenue[];
  topBranches: ITopBranchRevenue[];
}
