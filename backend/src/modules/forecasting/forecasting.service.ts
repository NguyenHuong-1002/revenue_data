import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { DatabaseService } from '../../models/database.service';
import {
  ForecastGranularity,
  IForecastCombinedResponse,
  IForecastDatasetResult,
  IForecastPoint,
} from './interfaces/forecast.interface';
import { ForecastQueryDto } from './DTO/forecast-query.dto';

type ForecastRow = RowDataPacket & {
  period: string;
  value: string | number;
};

@Injectable()
export class ForecastingService {
  constructor(private readonly db: DatabaseService) {}

  async getCombinedForecast(query: ForecastQueryDto): Promise<IForecastCombinedResponse> {
    const warnings: string[] = [];

    const [salesResult, inventoryResult] = await Promise.allSettled([
      this.getSalesForecast(query),
      this.getInventoryForecast(query),
    ]);

    const sales =
      salesResult.status === 'fulfilled'
        ? salesResult.value
        : this.extractWarning('sales', salesResult.reason, warnings);

    const inventory =
      inventoryResult.status === 'fulfilled'
        ? inventoryResult.value
        : this.extractWarning('inventory', inventoryResult.reason, warnings);

    return {
      horizon: query.horizon,
      alpha: query.alpha,
      filters: {
        productId: query.productId,
        branchId: query.branchId,
        plantId: query.plantId,
        distributionChannel: query.distributionChannel,
      },
      sales,
      inventory,
      warnings,
    };
  }

  async getSalesForecast(query: ForecastQueryDto): Promise<IForecastDatasetResult> {
    const series = await this.loadSalesSeries(query);

    if (series.length === 0) {
      throw new NotFoundException('No saleReport data found for the selected filters');
    }

    return this.buildDatasetResult('saleReport', 'month', series, query.horizon, query.alpha);
  }

  async getInventoryForecast(query: ForecastQueryDto): Promise<IForecastDatasetResult> {
    const series = await this.loadInventorySeries(query);

    if (series.length === 0) {
      throw new NotFoundException('No InventoryReport data found for the selected filters');
    }

    return this.buildDatasetResult('InventoryReport', 'day', series, query.horizon, query.alpha);
  }

  private extractWarning(
    scope: 'sales' | 'inventory',
    reason: unknown,
    warnings: string[],
  ): null {
    if (reason instanceof NotFoundException) {
      warnings.push(`${scope}: ${reason.message}`);
      return null;
    }

    throw reason;
  }

  private async loadSalesSeries(query: ForecastQueryDto): Promise<IForecastPoint[]> {
    const where: string[] = [];
    const params: Array<string | number> = [];

    if (query.productId) {
      where.push('product_id = ?');
      params.push(query.productId);
    }

    if (query.branchId) {
      where.push('branch_id = ?');
      params.push(query.branchId);
    }

    if (query.distributionChannel) {
      where.push('distribution_channel = ?');
      params.push(query.distributionChannel);
    }

    const sql = `
      SELECT DATE_FORMAT(time_report, '%Y-%m-01') AS period, SUM(sold_quantity) AS value
      FROM saleReport
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY DATE_FORMAT(time_report, '%Y-%m-01')
      ORDER BY period ASC
    `;

    const [rows] = await this.db.client.query<ForecastRow[]>(sql, params);

    return rows.map((row) => ({
      period: String(row.period),
      value: Number(row.value),
    }));
  }

  private async loadInventorySeries(query: ForecastQueryDto): Promise<IForecastPoint[]> {
    const where: string[] = [];
    const params: Array<string | number> = [];

    if (query.productId) {
      where.push('product_id = ?');
      params.push(query.productId);
    }

    if (query.plantId) {
      where.push('plant_id = ?');
      params.push(query.plantId);
    }

    const sql = `
      SELECT DATE(calendar_year_week) AS period, SUM(quantity) AS value
      FROM InventoryReport
      WHERE calendar_year_week IS NOT NULL
      ${where.length > 0 ? `AND ${where.join(' AND ')}` : ''}
      GROUP BY DATE(calendar_year_week)
      ORDER BY period ASC
    `;

    const [rows] = await this.db.client.query<ForecastRow[]>(sql, params);

    return rows.map((row) => ({
      period: String(row.period),
      value: Number(row.value),
    }));
  }

  private buildDatasetResult(
    source: 'saleReport' | 'InventoryReport',
    granularity: ForecastGranularity,
    series: IForecastPoint[],
    horizon: number,
    alpha: number,
  ): IForecastDatasetResult {
    const ema = this.buildEmaForecast(series, horizon, alpha, granularity);
    const linearRegression = this.buildLinearRegressionForecast(series, horizon, granularity);

    return {
      source,
      granularity,
      observations: series.length,
      history: series,
      ema,
      linearRegression,
    };
  }

  private buildEmaForecast(
    series: IForecastPoint[],
    horizon: number,
    alpha: number,
    granularity: ForecastGranularity,
  ): IForecastDatasetResult['ema'] {
    if (series.length === 0) {
      throw new BadRequestException('Series is empty');
    }

    const smoothedHistory: IForecastPoint[] = [];
    let lastSmoothed = series[0].value;

    smoothedHistory.push({
      period: series[0].period,
      value: this.round(lastSmoothed),
    });

    for (let i = 1; i < series.length; i += 1) {
      lastSmoothed = alpha * series[i].value + (1 - alpha) * lastSmoothed;
      smoothedHistory.push({
        period: series[i].period,
        value: this.round(lastSmoothed),
      });
    }

    const lastDate = this.parseDateKey(series[series.length - 1].period);
    const forecast: IForecastPoint[] = [];

    for (let i = 1; i <= horizon; i += 1) {
      forecast.push({
        period: this.formatFuturePeriod(lastDate, i, granularity),
        value: this.round(lastSmoothed),
      });
    }

    return {
      alpha,
      history: smoothedHistory,
      forecast,
      lastSmoothedValue: this.round(lastSmoothed),
    };
  }

  private buildLinearRegressionForecast(
    series: IForecastPoint[],
    horizon: number,
    granularity: ForecastGranularity,
  ): IForecastDatasetResult['linearRegression'] {
    if (series.length === 0) {
      throw new BadRequestException('Series is empty');
    }

    if (series.length === 1) {
      const forecast: IForecastPoint[] = [];
      const lastDate = this.parseDateKey(series[0].period);

      for (let i = 1; i <= horizon; i += 1) {
        forecast.push({
          period: this.formatFuturePeriod(lastDate, i, granularity),
          value: this.round(series[0].value),
        });
      }

      return {
        history: series,
        forecast,
        slope: 0,
        intercept: this.round(series[0].value),
      };
    }

    const n = series.length;
    const xs = series.map((_, index) => index + 1);
    const ys = series.map((point) => point.value);

    const sumX = xs.reduce((acc, value) => acc + value, 0);
    const sumY = ys.reduce((acc, value) => acc + value, 0);
    const sumXY = xs.reduce((acc, value, index) => acc + value * ys[index], 0);
    const sumX2 = xs.reduce((acc, value) => acc + value * value, 0);

    const denominator = n * sumX2 - sumX * sumX;
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    const forecast: IForecastPoint[] = [];
    const lastDate = this.parseDateKey(series[series.length - 1].period);

    for (let i = 1; i <= horizon; i += 1) {
      const x = n + i;
      forecast.push({
        period: this.formatFuturePeriod(lastDate, i, granularity),
        value: this.round(intercept + slope * x),
      });
    }

    return {
      history: series,
      forecast,
      slope: this.round(slope),
      intercept: this.round(intercept),
    };
  }

  private parseDateKey(value: string): Date {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date key: ${value}`);
    }
    return date;
  }

  private formatFuturePeriod(baseDate: Date, step: number, granularity: ForecastGranularity): string {
    const next = new Date(baseDate.getTime());

    if (granularity === 'month') {
      next.setUTCMonth(next.getUTCMonth() + step);
      next.setUTCDate(1);
    } else {
      next.setUTCDate(next.getUTCDate() + 7 * step);
    }

    return next.toISOString().slice(0, 10);
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}

