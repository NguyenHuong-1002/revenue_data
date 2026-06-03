// NestJS core: DI, exception classes
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// TypeORM: Repository pattern, InjectRepository
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleReportEntity } from '../../entities/sale-report.entity';
import { InventoryReportEntity } from '../../entities/inventory-report.entity';
import {
  ForecastGranularity,
  IChartPoint,
  IForecastCombinedResponse,
  IForecastDatasetResult,
  IForecastPoint,
} from './interfaces/forecast.interface';
import { ForecastQueryDto } from './DTO/forecast-query.dto';

@Injectable()
// ─── Service: du bao doanh so & ton kho su dung TypeORM ──────────────────────
export class ForecastingService {
  constructor(
    @InjectRepository(SaleReportEntity)
    private readonly saleReportRepo: Repository<SaleReportEntity>,
    @InjectRepository(InventoryReportEntity)
    private readonly inventoryReportRepo: Repository<InventoryReportEntity>,
    // eslint-disable-next-line prettier/prettier
  ) {}

  // ─── GET /forecast — ket hop ca 2 loai du bao ────────────────────────────
  async getCombinedForecast(query: ForecastQueryDto): Promise<IForecastCombinedResponse> {
    const warnings: string[] = [];

    // Chay song song 2 tac vu, cho phep 1 ben loi van tra ve ket qua ben kia
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

  // ─── GET /forecast/sales — du bao doanh so ───────────────────────────────
  async getSalesForecast(query: ForecastQueryDto): Promise<IForecastDatasetResult> {
    const granularity = query.periodType ?? 'month';
    const series = await this.loadSalesSeries(query, granularity);

    if (series.length === 0) {
      throw new NotFoundException('No saleReport data found for the selected filters');
    }

    return this.buildDatasetResult('saleReport', granularity, series, query.horizon, query.alpha);
  }

  // ─── GET /forecast/inventory — du bao ton kho ────────────────────────────
  async getInventoryForecast(query: ForecastQueryDto): Promise<IForecastDatasetResult> {
    const series = await this.loadInventorySeries(query);

    if (series.length === 0) {
      throw new NotFoundException('No InventoryReport data found for the selected filters');
    }

    return this.buildDatasetResult('InventoryReport', 'day', series, query.horizon, query.alpha);
  }

  // ─── Trich xuat warning tu Promise.allSettled (khong nem lai NotFound) ────
  private extractWarning(scope: 'sales' | 'inventory', reason: unknown, warnings: string[]): null {
    if (reason instanceof NotFoundException) {
      warnings.push(`${scope}: ${reason.message}`);
      return null;
    }
    // Cac loi khac (InternalServerError, etc.) van nem len de controller handle
    throw reason;
  }

  // ─── Lay chuoi thoi gian doanh so tu DB su dung TypeORM ─────────────────
  private async loadSalesSeries(
    query: ForecastQueryDto,
    granularity: ForecastGranularity,
  ): Promise<IForecastPoint[]> {
    // Xay dung SelectQueryBuilder cho bang saleReport (alias 'sr')
    const qb = this.saleReportRepo
      .createQueryBuilder('sr')
      .select(this.buildPeriodExpr(granularity, 'sr'), 'period')
      .addSelect('SUM(sr.sold_quantity)', 'value');

    // Dieu kien loc tuy chon
    if (query.productId) {
      qb.andWhere('sr.product_id = :productId', { productId: query.productId });
    }
    if (query.branchId) {
      qb.andWhere('sr.branch_id = :branchId', { branchId: query.branchId });
    }
    if (query.distributionChannel) {
      qb.andWhere('sr.distribution_channel = :distributionChannel', {
        distributionChannel: query.distributionChannel,
      });
    }
    // Loc theo khoang thoi gian
    if (query.startDate) {
      qb.andWhere('sr.time_report >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('sr.time_report <= :endDate', { endDate: query.endDate });
    }

    // GROUP BY va ORDER BY
    qb.groupBy(this.buildPeriodExpr(granularity, 'sr'));
    qb.orderBy('period', 'ASC');

    // getRawMany: tra ve object phang (khong phai entity) vi co SUM/ GROUP BY
    const rows = await qb.getRawMany<{ period: string; value: string | number }>();

    return rows.map((row) => ({
      period: String(row.period),
      value: Number(row.value),
    }));
  }

  // ─── Lay chuoi thoi gian ton kho tu DB su dung TypeORM ──────────────────
  private async loadInventorySeries(query: ForecastQueryDto): Promise<IForecastPoint[]> {
    const qb = this.inventoryReportRepo
      .createQueryBuilder('ir')
      .select('DATE(ir.calendar_year_week)', 'period')
      .addSelect('SUM(ir.quantity)', 'value')
      .where('ir.calendar_year_week IS NOT NULL');

    if (query.productId) {
      qb.andWhere('ir.product_id = :productId', { productId: query.productId });
    }
    if (query.plantId) {
      qb.andWhere('ir.plant_id = :plantId', { plantId: query.plantId });
    }

    qb.groupBy('DATE(ir.calendar_year_week)');
    qb.orderBy('period', 'ASC');

    const rows = await qb.getRawMany<{ period: string; value: string | number }>();

    return rows.map((row) => ({
      period: String(row.period),
      value: Number(row.value),
    }));
  }

  // ─── Dong goi ket qua du bao cho 1 nguon (sales / inventory) ────────────
  private buildDatasetResult(
    source: 'saleReport' | 'InventoryReport',
    granularity: ForecastGranularity,
    series: IForecastPoint[],
    horizon: number,
    alpha: number,
  ): IForecastDatasetResult {
    const ema = this.buildEmaForecast(series, horizon, alpha, granularity);
    const linearRegression = this.buildLinearRegressionForecast(series, horizon, granularity);

    // Gop tat ca diem du lieu vao 1 mang phang, danh nhan day du cho chart
    const chartData: IChartPoint[] = [
      // 1. Diem lich su thuc te tu DB
      ...series.map((p) => ({
        period: p.period,
        value: p.value,
        type: 'actual' as const,
        algorithm: 'actual' as const,
      })),
      // 2. Diem du bao tu EMA (gia tri lam muot cuoi cung)
      ...ema.forecast.map((p) => ({
        period: p.period,
        value: p.value,
        type: 'forecast' as const,
        algorithm: 'ema' as const,
      })),
      // 3. Diem du bao tu hoi quy tuyen tinh
      ...linearRegression.forecast.map((p) => ({
        period: p.period,
        value: p.value,
        type: 'forecast' as const,
        algorithm: 'linearRegression' as const,
      })),
    ];

    return {
      source,
      granularity,
      observations: series.length,
      history: series,
      ema,
      linearRegression,
      chartData,
    };
  }

  // ─── Thuat toan EMA (Exponential Moving Average) ─────────────────────────
  // Cong thuc: S(t) = alpha * Y(t) + (1 - alpha) * S(t-1)
  // - alpha: trong so cho gia tri hien tai (0.01 - 0.99)
  // - horizon: so ky du bao ve tuong lai (gia tri = S cuoi cung)
  private buildEmaForecast(
    series: IForecastPoint[],
    horizon: number,
    alpha: number,
    granularity: ForecastGranularity,
  ): IForecastDatasetResult['ema'] {
    if (series.length === 0) {
      throw new BadRequestException('Series is empty');
    }

    // Tinh gia tri lam muot cho tung diem trong qua khu
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

    // Du bao: gia tri lam muot cuoi cung duoc giu nguyen cho tat ca cac ky
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

  // ─── Thuat toan hoi quy tuyen tinh (Linear Regression) ───────────────────
  // Y = intercept + slope * x
  // - slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX^2)
  // - intercept = (sumY - slope * sumX) / n
  private buildLinearRegressionForecast(
    series: IForecastPoint[],
    horizon: number,
    granularity: ForecastGranularity,
  ): IForecastDatasetResult['linearRegression'] {
    if (series.length === 0) {
      throw new BadRequestException('Series is empty');
    }

    // Truong hop dac biet: chi co 1 diem du lieu → du bang slope = 0
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

    // Tinh toan cac tong cho phuong trinh hoi quy
    const n = series.length;
    const xs = series.map((_, index) => index + 1); // bien doc lap: index + 1
    const ys = series.map((point) => point.value); // bien phu thuoc: value

    const sumX = xs.reduce((acc, value) => acc + value, 0);
    const sumY = ys.reduce((acc, value) => acc + value, 0);
    const sumXY = xs.reduce((acc, value, index) => acc + value * ys[index], 0);
    const sumX2 = xs.reduce((acc, value) => acc + value * value, 0);

    const denominator = n * sumX2 - sumX * sumX;
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Du bao tuong lai: Y(x) = intercept + slope * x
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

  // ─── Xay dung bieu thuc SQL GROUP BY theo loai ky ────────────────────────
  private buildPeriodExpr(granularity: ForecastGranularity, alias: string): string {
    switch (granularity) {
      case 'week':
        return `DATE_FORMAT(${alias}.time_report, '%x-%v')`;
      case 'quarter':
        return `CONCAT(YEAR(${alias}.time_report), '-Q', QUARTER(${alias}.time_report))`;
      case 'month':
      default:
        return `DATE_FORMAT(${alias}.time_report, '%Y-%m-01')`;
    }
  }

  // ─── Parse chuoi ngay thanh Date object ──────────────────────────────────
  private parseDateKey(value: string): Date {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date key: ${value}`);
    }
    return date;
  }

  // ─── Tinh ky trong tuong lai dua vao ky hien tai ────────────────────────
  private formatFuturePeriod(
    baseDate: Date,
    step: number,
    granularity: ForecastGranularity,
  ): string {
    const next = new Date(baseDate.getTime());

    switch (granularity) {
      case 'month':
        next.setUTCMonth(next.getUTCMonth() + step);
        next.setUTCDate(1);
        break;
      case 'week':
        next.setUTCDate(next.getUTCDate() + 7 * step);
        break;
      case 'quarter':
        next.setUTCMonth(next.getUTCMonth() + 3 * step);
        next.setUTCDate(1);
        break;
      default:
        next.setUTCDate(next.getUTCDate() + 7 * step);
    }

    return next.toISOString().slice(0, 10);
  }

  // ─── Lam tron so ve 2 chu so thap phan ──────────────────────────────────
  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}
