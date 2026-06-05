import api from '@/lib/axios';

export interface ForecastQueryDto {
  productId?: string;
  branchId?: string;
  plantId?: string;
  distributionChannel?: string;
  horizon?: number;
  alpha?: number;
  startDate?: string;
  endDate?: string;
  periodType?: 'month' | 'week' | 'quarter';
  scope?: 'all' | 'sales' | 'inventory';
}

export interface IChartPoint {
  period: string;
  value: number;
  type: 'actual' | 'forecast';
  algorithm: 'actual' | 'ema' | 'linearRegression';
}

export interface IForecastPoint {
  period: string;
  value: number;
}

export interface IForecastAlgorithmResult {
  history: IForecastPoint[];
  forecast: IForecastPoint[];
}

export interface IForecastDatasetResult {
  source: 'saleReport' | 'InventoryReport';
  granularity: 'month' | 'week' | 'quarter' | 'day';
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

export const forecastService = {
  getCombinedForecast(params?: ForecastQueryDto) {
    return api.get<IForecastCombinedResponse>('/forecast', { params });
  },

  getSalesForecast(params?: ForecastQueryDto) {
    return api.get<IForecastDatasetResult>('/forecast/sales', { params });
  },

  getInventoryForecast(params?: ForecastQueryDto) {
    return api.get<IForecastDatasetResult>('/forecast/inventory', { params });
  },
};
