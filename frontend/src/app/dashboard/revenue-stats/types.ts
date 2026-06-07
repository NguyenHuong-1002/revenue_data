export interface ProductInfo {
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

export interface RevenueKpis {
  totalRevenue: number;
  growthRate: number;
  topProductByRevenue: {
    id: string;
    name: string;
    revenue: number;
    quantity?: number;
    detail_product_group: string;
    gender: string;
    color: string;
    size: number;
  };
  topProductByQuantity: {
    id: string;
    name: string;
    quantity: number;
    revenue?: number;
    detail_product_group: string;
    gender: string;
    color: string;
    size: number;
  };
}

export interface ChartData {
  distribution_channel: { name: string; count: number }[];
  monthly_sales: { name: string; count: number }[];
  top_branches: { name: string; count: number }[];
}

export interface HighlightProducts {
  topRevenue: ProductInfo[];
  bottomRevenue: ProductInfo[];
  topQuantity: ProductInfo[];
  bottomQuantity: ProductInfo[];
  topGrowth: ProductInfo[];
  bottomGrowth: ProductInfo[];
}
