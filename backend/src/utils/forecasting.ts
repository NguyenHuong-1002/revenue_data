export type HoltWintersOptions = {
  seasonLength?: number;
  forecastHorizon?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  optimize?: boolean;
};

export type HoltWintersForecastResult = {
  level: number;
  trend: number;
  seasonal: number[];
  forecast: number[];
  fitted: number[];
  errors: number[];
  params: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  metrics: {
    mae: number;
    rmse: number;
    mape: number | null;
  };
};

export type SafetyStockOptions = {
  leadTimeDays: number;
  serviceLevel?: 0.9 | 0.95 | 0.99 | number;
  currentStock?: number;
};

export type SafetyStockResult = {
  avgDemand: number;
  stdDev: number;
  safetyStock: number;
  reorderPoint: number;
  maxStock: number;
  avgStock: number;
  orderQuantity: number | null;
  status: 'LOW' | 'REORDER' | 'STABLE' | null;
};

type HoltWintersParams = {
  alpha: number;
  beta: number;
  gamma: number;
};

const DEFAULT_HOLT_WINTERS_PARAMS: HoltWintersParams = {
  alpha: 0.2,
  beta: 0.1,
  gamma: 0.3,
};

const Z_SCORE_BY_SERVICE_LEVEL = new Map<number, number>([
  [0.9, 1.28],
  [0.95, 1.65],
  [0.99, 2.33],
]);

export function forecastRevenueHoltWinters(
  data: number[],
  options: HoltWintersOptions = {},
): HoltWintersForecastResult {
  const seasonLength = options.seasonLength ?? 12;
  const forecastHorizon = options.forecastHorizon ?? 6;

  assertPositiveInteger(seasonLength, 'seasonLength');
  assertPositiveInteger(forecastHorizon, 'forecastHorizon');
  assertNumberSeries(data, 'data');

  if (data.length < seasonLength) {
    throw new Error('data length must be greater than or equal to seasonLength');
  }

  const shouldOptimize = options.optimize ?? options.alpha === undefined;
  const params = shouldOptimize
    ? findBestHoltWintersParams(data, seasonLength)
    : {
        alpha: options.alpha ?? DEFAULT_HOLT_WINTERS_PARAMS.alpha,
        beta: options.beta ?? DEFAULT_HOLT_WINTERS_PARAMS.beta,
        gamma: options.gamma ?? DEFAULT_HOLT_WINTERS_PARAMS.gamma,
      };

  assertSmoothingParams(params);

  return runHoltWinters(data, seasonLength, forecastHorizon, params);
}

export function calculateSafetyStock(
  demandHistory: number[],
  options: SafetyStockOptions,
): SafetyStockResult {
  assertNumberSeries(demandHistory, 'demandHistory');
  assertNonNegativeNumber(options.leadTimeDays, 'leadTimeDays');

  const serviceLevel = options.serviceLevel ?? 0.95;
  const zScore = Z_SCORE_BY_SERVICE_LEVEL.get(serviceLevel) ?? 1.65;
  const avgDemand = average(demandHistory);
  const stdDev = standardDeviation(demandHistory, avgDemand);
  const leadTimeMonths = options.leadTimeDays / 30;

  const safetyStock = zScore * stdDev * Math.sqrt(leadTimeMonths);
  const reorderPoint = avgDemand * leadTimeMonths + safetyStock;
  const maxStock = reorderPoint + avgDemand;
  const avgStock = (maxStock + safetyStock) / 2;

  let orderQuantity: number | null = null;
  let status: SafetyStockResult['status'] = null;

  if (options.currentStock !== undefined) {
    assertNonNegativeNumber(options.currentStock, 'currentStock');
    orderQuantity = Math.max(0, maxStock - options.currentStock);
    status =
      options.currentStock < safetyStock
        ? 'LOW'
        : options.currentStock < reorderPoint
          ? 'REORDER'
          : 'STABLE';
  }

  return {
    avgDemand: round(avgDemand, 2),
    stdDev: round(stdDev, 2),
    safetyStock: Math.round(safetyStock),
    reorderPoint: Math.round(reorderPoint),
    maxStock: Math.round(maxStock),
    avgStock: Math.round(avgStock),
    orderQuantity: orderQuantity === null ? null : Math.round(orderQuantity),
    status,
  };
}

function runHoltWinters(
  data: number[],
  seasonLength: number,
  forecastHorizon: number,
  params: HoltWintersParams,
): HoltWintersForecastResult {
  const { alpha, beta, gamma } = params;
  const n = data.length;
  let level = average(data.slice(0, seasonLength));
  let trend = initialTrend(data, seasonLength);
  const seasonal = data.slice(0, seasonLength).map((value) => value - level);
  const fitted: number[] = [];
  const errors: number[] = [];

  for (let t = 0; t < n; t++) {
    const seasonalIndex = t % seasonLength;
    const previousLevel = level;
    const previousTrend = trend;
    const previousSeason = seasonal[seasonalIndex];
    const predicted = previousLevel + previousTrend + previousSeason;

    fitted.push(Math.max(0, predicted));
    errors.push(data[t] - predicted);

    level = alpha * (data[t] - previousSeason) + (1 - alpha) * (previousLevel + previousTrend);
    trend = beta * (level - previousLevel) + (1 - beta) * previousTrend;
    seasonal[seasonalIndex] = gamma * (data[t] - level) + (1 - gamma) * previousSeason;
  }

  const forecast = Array.from({ length: forecastHorizon }, (_, index) => {
    const step = index + 1;
    const seasonalIndex = (n + step - 1) % seasonLength;
    return Math.max(0, Math.round(level + step * trend + seasonal[seasonalIndex]));
  });

  return {
    level: round(level, 2),
    trend: round(trend, 2),
    seasonal: seasonal.map((value) => round(value, 2)),
    forecast,
    fitted: fitted.map((value) => round(value, 2)),
    errors: errors.map((value) => round(value, 2)),
    params,
    metrics: calculateForecastMetrics(data, fitted),
  };
}

function findBestHoltWintersParams(data: number[], seasonLength: number): HoltWintersParams {
  let bestParams = DEFAULT_HOLT_WINTERS_PARAMS;
  let bestMape = Infinity;

  for (let alphaStep = 1; alphaStep <= 9; alphaStep++) {
    for (let betaStep = 1; betaStep <= 10; betaStep++) {
      for (let gammaStep = 1; gammaStep <= 9; gammaStep++) {
        const params = {
          alpha: round(alphaStep / 10, 2),
          beta: round(betaStep / 20, 2),
          gamma: round(gammaStep / 10, 2),
        };
        const result = runHoltWinters(data, seasonLength, 1, params);
        const mape = result.metrics.mape ?? Infinity;

        if (mape < bestMape) {
          bestMape = mape;
          bestParams = params;
        }
      }
    }
  }

  return bestParams;
}

function calculateForecastMetrics(actual: number[], predicted: number[]) {
  let mae = 0;
  let mse = 0;
  let mape = 0;
  let mapeCount = 0;

  for (let i = 0; i < actual.length; i++) {
    const error = actual[i] - predicted[i];
    mae += Math.abs(error);
    mse += error * error;

    if (actual[i] > 0) {
      mape += Math.abs(error / actual[i]);
      mapeCount++;
    }
  }

  return {
    mae: round(mae / actual.length, 2),
    rmse: round(Math.sqrt(mse / actual.length), 2),
    mape: mapeCount === 0 ? null : round((mape / mapeCount) * 100, 2),
  };
}

function initialTrend(data: number[], seasonLength: number): number {
  if (data.length >= seasonLength * 2) {
    let trend = 0;
    for (let i = 0; i < seasonLength; i++) {
      trend += data[seasonLength + i] - data[i];
    }
    return trend / (seasonLength * seasonLength);
  }

  if (data.length === 1) {
    return 0;
  }

  return (data[data.length - 1] - data[0]) / (data.length - 1);
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[], mean: number): number {
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}

function assertNumberSeries(values: number[], name: string): void {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`${name} must be a non-empty number array`);
  }

  values.forEach((value, index) => {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name}[${index}] must be a non-negative finite number`);
    }
  });
}

function assertSmoothingParams(params: HoltWintersParams): void {
  assertRatio(params.alpha, 'alpha');
  assertRatio(params.beta, 'beta');
  assertRatio(params.gamma, 'gamma');
}

function assertRatio(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${name} must be between 0 and 1`);
  }
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
}

function assertNonNegativeNumber(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative finite number`);
  }
}

function round(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}
