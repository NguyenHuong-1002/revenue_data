export type ForecastSource = 'saleReport' | 'InventoryReport';

export type ForecastGranularity = 'month' | 'week' | 'quarter' | 'day';

export interface IForecastPoint {
  period: string;
  value: number;
}

// ─── Diem du lieu san sang cho ve bieu do ─────────────────────────────────
export interface IChartPoint {
  period: string;
  value: number;
  type: 'actual' | 'forecast'; // actual = lich su, forecast = du bao
  algorithm: 'actual' | 'ema' | 'linearRegression'; // thuat toan tao ra diem nay
}

export interface IForecastAlgorithmResult {
  history: IForecastPoint[];
  forecast: IForecastPoint[];
}

export interface IForecastDatasetResult {
  source: ForecastSource;
  granularity: ForecastGranularity;
  observations: number;
  history: IForecastPoint[];
  ema: IForecastAlgorithmResult & {
    alpha: number;
    lastSmoothedValue: number;
  };
  linearRegression: IForecastAlgorithmResult & {
    slope: number;
    intercept: number;
  };
  // Mang phang tat ca diem du lieu, moi diem da danh nhan type + algorithm
  // => frontend co the truc tiep ve bieu do ma khong can xu ly them
  chartData: IChartPoint[];
}

export interface IForecastCombinedResponse {
  horizon: number;
  alpha: number;
  filters: {
    productId?: string;
    branchId?: string;
    plantId?: string;
    distributionChannel?: string;
  };
  sales: IForecastDatasetResult | null;
  inventory: IForecastDatasetResult | null;
  warnings: string[];
}
