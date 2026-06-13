import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/models/database.service';
import { ForecastQueryDto } from './DTO/forecast-query.dto';
import {
  IChartPoint,
  IForecastAlgorithmResult,
  IForecastCombinedResponse,
  IForecastDatasetResult,
  IForecastPoint,
} from './interfaces/forecast.interface';
import { RowDataPacket } from 'mysql2';

/**
 * Dịch vụ dự báo (Forecasting Service) cung cấp các thuật toán dự báo doanh thu và hàng tồn kho
 */
@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);

  /**
   * Khởi tạo class ForecastingService
   * @param db DatabaseService kết nối cơ sở dữ liệu
   */
  constructor(private readonly db: DatabaseService) {}

  /**
   * Lấy dữ liệu dự báo kết hợp cho cả doanh thu và hàng tồn kho
   * @param query DTO chứa các tham số truy vấn và cấu hình dự báo
   * @returns Kết quả dự báo kết hợp bao gồm thông tin chi tiết của doanh thu, hàng tồn kho và các cảnh báo
   */
  async getCombinedForecast(query: ForecastQueryDto): Promise<IForecastCombinedResponse> {
    const warnings: string[] = [];
    const sales =
      query.scope === 'all' || query.scope === 'sales' ? await this.getSalesForecast(query) : null;
    const inventory =
      query.scope === 'all' || query.scope === 'inventory'
        ? await this.getInventoryForecast(query)
        : null;

    if (sales && sales.observations < 2) {
      warnings.push('Not enough sales data points for reliable forecasting');
    }
    if (inventory && inventory.observations < 2) {
      warnings.push('Not enough inventory data points for reliable forecasting');
    }

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

  /**
   * Lấy kết quả dự báo doanh thu dựa trên lịch sử bán hàng và thuật toán được cấu hình
   * @param query DTO chứa các tham số lọc và thông tin cấu hình dự báo
   * @returns Kết quả dự báo doanh thu chi tiết (lịch sử, EMA, hồi quy tuyến tính, dữ liệu biểu đồ)
   */
  async getSalesForecast(query: ForecastQueryDto): Promise<IForecastDatasetResult> {
    const history = await this.fetchSalesHistory(query);
    return this.computeForecast(history, 'saleReport', query);
  }

  /**
   * Lấy kết quả dự báo hàng tồn kho dựa trên lịch sử tồn kho và thuật toán được cấu hình
   * @param query DTO chứa các tham số lọc và thông tin cấu hình dự báo
   * @returns Kết quả dự báo hàng tồn kho chi tiết (lịch sử, EMA, hồi quy tuyến tính, dữ liệu biểu đồ)
   */
  async getInventoryForecast(query: ForecastQueryDto): Promise<IForecastDatasetResult> {
    const history = await this.fetchInventoryHistory(query);
    return this.computeForecast(history, 'InventoryReport', query);
  }

  // ─── Data fetching ────────────────────────────────────────────────────────

  /**
   * Truy vấn lịch sử doanh thu từ cơ sở dữ liệu dựa trên các điều kiện lọc và nhóm theo chu kỳ
   * @param query DTO chứa các tham số lọc (sản phẩm, chi nhánh, kênh phân phối, thời gian) và loại chu kỳ
   * @returns Danh sách các điểm dữ liệu lịch sử doanh thu
   */
  private async fetchSalesHistory(query: ForecastQueryDto): Promise<IForecastPoint[]> {
    const { periodType, startDate, endDate, productId, branchId, distributionChannel } = query;
    const whereClauses: string[] = [];
    const values: unknown[] = [];

    if (productId) {
      whereClauses.push('product_id = ?');
      values.push(productId);
    }
    if (branchId) {
      whereClauses.push('branch_id = ?');
      values.push(branchId);
    }
    if (distributionChannel) {
      whereClauses.push('distribution_channel = ?');
      values.push(distributionChannel);
    }
    if (startDate) {
      whereClauses.push('time_report >= ?');
      values.push(startDate);
    }
    if (endDate) {
      whereClauses.push('time_report <= ?');
      values.push(endDate + ' 23:59:59');
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const periodExpr = this.periodExpression('time_report', periodType);

    const sql = `
      SELECT ${periodExpr} AS period, SUM(sold_quantity) AS value
      FROM saleReport ${whereSQL}
      GROUP BY period
      ORDER BY period ASC
    `;

    const [rows] = await this.db.client.query<RowDataPacket[]>(sql, values);
    return rows.map((r) => ({ period: String(r.period), value: Number(r.value) }));
  }

  /**
   * Truy vấn lịch sử tồn kho từ cơ sở dữ liệu dựa trên các điều kiện lọc và nhóm theo chu kỳ
   * @param query DTO chứa các tham số lọc (sản phẩm, nhà máy, thời gian) và loại chu kỳ
   * @returns Danh sách các điểm dữ liệu lịch sử tồn kho
   */
  private async fetchInventoryHistory(query: ForecastQueryDto): Promise<IForecastPoint[]> {
    const { periodType, startDate, endDate, productId, plantId } = query;
    const whereClauses: string[] = [];
    const values: unknown[] = [];

    if (productId) {
      whereClauses.push('product_id = ?');
      values.push(productId);
    }
    if (plantId) {
      whereClauses.push('plant_id = ?');
      values.push(plantId);
    }
    if (startDate) {
      whereClauses.push('calendar_year_week >= ?');
      values.push(startDate);
    }
    if (endDate) {
      whereClauses.push('calendar_year_week <= ?');
      values.push(endDate + ' 23:59:59');
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const periodExpr = this.periodExpression('calendar_year_week', periodType);

    const sql = `
      SELECT ${periodExpr} AS period, SUM(quantity) AS value
      FROM InventoryReport ${whereSQL}
      GROUP BY period
      ORDER BY period ASC
    `;

    const [rows] = await this.db.client.query<RowDataPacket[]>(sql, values);
    return rows.map((r) => ({ period: String(r.period), value: Number(r.value) }));
  }

  // ─── Forecasting algorithms ───────────────────────────────────────────────

  /**
   * Tính toán các chỉ số dự báo (EMA, hồi quy tuyến tính) và tổng hợp dữ liệu biểu đồ từ lịch sử
   * @param history Danh sách điểm dữ liệu lịch sử thực tế
   * @param source Nguồn dữ liệu báo cáo (doanh thu hoặc tồn kho)
   * @param query DTO chứa các thông số dự báo (alpha, horizon, chu kỳ)
   * @returns Đối tượng kết quả dự báo tổng hợp cho tập dữ liệu
   */
  private computeForecast(
    history: IForecastPoint[],
    source: 'saleReport' | 'InventoryReport',
    query: ForecastQueryDto,
  ): IForecastDatasetResult {
    const values = history.map((p) => p.value);
    const n = values.length;

    const ema = this.computeEMA(values, query.alpha, query.horizon);
    const linearRegression = this.computeLinearRegression(values, query.horizon);
    const chartData = this.buildChartData(history, ema, linearRegression, query.alpha);

    return {
      source,
      granularity: query.periodType ?? 'month',
      observations: n,
      history,
      ema,
      linearRegression,
      chartData,
    };
  }

  /**
   * Tính toán dự báo theo thuật toán Trung bình động lũy thừa (Exponential Moving Average - EMA)
   * @param values Mảng các giá trị số thực tế từ lịch sử
   * @param alpha Hệ số san bằng lũy thừa (0 < alpha <= 1)
   * @param horizon Khoảng thời gian dự báo tương lai
   * @returns Kết quả tính toán EMA cho lịch sử và dự báo tương lai, kèm theo các tham số
   */
  private computeEMA(
    values: number[],
    alpha: number,
    horizon: number,
  ): IForecastAlgorithmResult & { alpha: number; lastSmoothedValue: number } {
    const history: IForecastPoint[] = [];
    const forecast: IForecastPoint[] = [];

    if (values.length === 0) {
      return { history: [], forecast: [], alpha, lastSmoothedValue: 0 };
    }

    let smoothed = values[0];
    // We don't have period labels for individual indices; we'll label at the end.
    // Store raw smoothed values.
    history.push({ period: '', value: smoothed });

    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed;
      history.push({ period: '', value: smoothed });
    }

    const lastSmoothedValue = smoothed;
    for (let h = 1; h <= horizon; h++) {
      // Flat forecast: EMA stays at last smoothed value
      forecast.push({ period: '', value: lastSmoothedValue });
    }

    return { history, forecast, alpha, lastSmoothedValue };
  }

  /**
   * Tính toán dự báo theo phương pháp Hồi quy tuyến tính (Linear Regression)
   * @param values Mảng các giá trị số thực tế từ lịch sử
   * @param horizon Khoảng thời gian dự báo tương lai
   * @returns Kết quả tính toán đường hồi quy cho lịch sử và dự báo tương lai, kèm theo hệ số góc và điểm cắt
   */
  private computeLinearRegression(
    values: number[],
    horizon: number,
  ): IForecastAlgorithmResult & { slope: number; intercept: number } {
    const history: IForecastPoint[] = [];
    const forecast: IForecastPoint[] = [];

    const n = values.length;
    if (n < 2) {
      return {
        history: n === 0 ? [] : values.map(() => ({ period: '', value: 0 })),
        forecast: [],
        slope: 0,
        intercept: n === 1 ? values[0] : 0,
      };
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    for (let i = 0; i < n; i++) {
      history.push({ period: '', value: slope * i + intercept });
    }

    for (let h = 1; h <= horizon; h++) {
      const idx = n + h - 1;
      forecast.push({ period: '', value: slope * idx + intercept });
    }

    return { history, forecast, slope, intercept };
  }

  // ─── Chart data assembly ──────────────────────────────────────────────────

  /**
   * Tổng hợp và chuẩn hóa dữ liệu lịch sử cùng các kết quả dự báo thành cấu trúc hiển thị biểu đồ
   * @param actuals Danh sách các điểm dữ liệu thực tế lịch sử
   * @param ema Kết quả thuật toán EMA bao gồm lịch sử đã san bằng và dự báo
   * @param lr Kết quả thuật toán hồi quy tuyến tính bao gồm đường xu hướng và dự báo
   * @param alpha Hệ số alpha sử dụng trong tính toán EMA
   * @returns Danh sách các điểm dữ liệu biểu đồ đã được gán loại và thuật toán tương ứng
   */
  private buildChartData(
    actuals: IForecastPoint[],
    ema: IForecastAlgorithmResult & { alpha: number; lastSmoothedValue: number },
    lr: IForecastAlgorithmResult & { slope: number; intercept: number },
    alpha: number,
  ): IChartPoint[] {
    const chartData: IChartPoint[] = [];

    for (let i = 0; i < actuals.length; i++) {
      chartData.push({
        period: actuals[i].period,
        value: actuals[i].value,
        type: 'actual',
        algorithm: 'actual',
      });
    }

    // Assign period labels to EMA history
    for (let i = 0; i < ema.history.length && i < actuals.length; i++) {
      chartData.push({
        period: actuals[i].period,
        value: ema.history[i].value,
        type: 'actual',
        algorithm: 'ema',
      });
    }

    // Assign period labels to LR history
    for (let i = 0; i < lr.history.length && i < actuals.length; i++) {
      chartData.push({
        period: actuals[i].period,
        value: lr.history[i].value,
        type: 'actual',
        algorithm: 'linearRegression',
      });
    }

    // Forecast periods: generate next period labels
    const lastPeriod = actuals.length > 0 ? actuals[actuals.length - 1].period : '';
    for (let h = 0; h < ema.forecast.length; h++) {
      const nextPeriod = this.nextPeriod(lastPeriod, h + 1);
      chartData.push({
        period: nextPeriod,
        value: ema.forecast[h].value,
        type: 'forecast',
        algorithm: 'ema',
      });
    }

    for (let h = 0; h < lr.forecast.length; h++) {
      const nextPeriod = this.nextPeriod(lastPeriod, h + 1);
      chartData.push({
        period: nextPeriod,
        value: lr.forecast[h].value,
        type: 'forecast',
        algorithm: 'linearRegression',
      });
    }

    return chartData;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Chuyển đổi loại chu kỳ thời gian thành biểu thức SQL tương ứng trên MySQL để nhóm dữ liệu
   * @param column Tên cột dữ liệu thời gian trong bảng
   * @param periodType Loại chu kỳ (day, week, month, quarter)
   * @returns Biểu thức SQL định dạng thời gian phù hợp
   */
  private periodExpression(column: string, periodType?: string): string {
    switch (periodType) {
      case 'week':
        return `DATE_FORMAT(${column}, '%x-W%v')`;
      case 'quarter':
        return `CONCAT(YEAR(${column}), '-Q', QUARTER(${column}))`;
      case 'day':
        return `DATE(${column})`;
      case 'month':
      default:
        return `DATE_FORMAT(${column}, '%Y-%m-01')`;
    }
  }

  /**
   * Tính toán nhãn chu kỳ tiếp theo dựa trên nhãn chu kỳ hiện tại và số bước dịch chuyển
   * @param currentPeriod Nhãn chu kỳ thời gian hiện tại
   * @param offset Khoảng dịch chuyển thời gian về phía trước (số bước)
   * @returns Nhãn chu kỳ tiếp theo tương ứng định dạng
   */
  private nextPeriod(currentPeriod: string, offset: number): string {
    if (!currentPeriod) return `period-${offset}`;

    // Handle month format: YYYY-MM-01
    const monthMatch = currentPeriod.match(/^(\d{4})-(\d{2})/);
    if (monthMatch) {
      const year = Number(monthMatch[1]);
      const month = Number(monthMatch[2]);
      const totalMonths = year * 12 + (month - 1) + offset;
      const newYear = Math.floor(totalMonths / 12);
      const newMonth = (totalMonths % 12) + 1;
      return `${newYear}-${String(newMonth).padStart(2, '0')}-01`;
    }

    // Handle quarter format: YYYY-QN
    const qMatch = currentPeriod.match(/^(\d{4})-Q(\d)/);
    if (qMatch) {
      const year = Number(qMatch[1]);
      const q = Number(qMatch[2]);
      const totalQ = year * 4 + (q - 1) + offset;
      const newYear = Math.floor(totalQ / 4);
      const newQ = (totalQ % 4) + 1;
      return `${newYear}-Q${newQ}`;
    }

    // Handle week format: YYYY-WNN
    const wMatch = currentPeriod.match(/^(\d{4})-W(\d+)$/);
    if (wMatch) {
      const year = Number(wMatch[1]);
      const week = Number(wMatch[2]);
      const totalWeeks = year * 52 + (week - 1) + offset;
      const newYear = Math.floor(totalWeeks / 52);
      const newWeek = (totalWeeks % 52) + 1;
      return `${newYear}-W${String(newWeek).padStart(2, '0')}`;
    }

    // Day format: YYYY-MM-DD
    const dayMatch = currentPeriod.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dayMatch) {
      const d = new Date(currentPeriod);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    }

    return `${currentPeriod}+${offset}`;
  }
}
