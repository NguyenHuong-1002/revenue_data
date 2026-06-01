export type ForecastSource = 'saleReport' | 'InventoryReport';

export type ForecastGranularity = 'month' | 'day';

export interface IForecastPoint {
  period: string;
  value: number;
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

