import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ApiGetCombinedForecastSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy dự báo kết hợp Doanh số & Tồn kho',
      description:
        'Trả về kết quả dự báo cho cả hai nguồn dữ liệu (saleReport và InventoryReport) trong một lần gọi. ' +
        'Sử dụng hai thuật toán: EMA (Exponential Moving Average) và Linear Regression. ' +
        'Kết quả bao gồm lịch sử, giá trị dự báo, biểu đồ dữ liệu và các cảnh báo nếu một nguồn không có dữ liệu. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiQuery({
      name: 'productId',
      required: false,
      type: String,
      example: 'P001',
      description: 'Lọc theo mã sản phẩm (áp dụng cho cả doanh số và tồn kho)',
    }),
    ApiQuery({
      name: 'branchId',
      required: false,
      type: String,
      example: '1100',
      description: 'Lọc theo mã chi nhánh (chỉ áp dụng cho dự báo doanh số)',
    }),
    ApiQuery({
      name: 'plantId',
      required: false,
      type: String,
      example: '1201',
      description: 'Lọc theo mã nhà máy (chỉ áp dụng cho dự báo tồn kho)',
    }),
    ApiQuery({
      name: 'distributionChannel',
      required: false,
      type: String,
      example: 'Online',
      description: 'Lọc theo kênh phân phối (chỉ áp dụng cho dự báo doanh số)',
    }),
    ApiQuery({
      name: 'horizon',
      required: false,
      type: Number,
      example: 3,
      description: 'Số kỳ dự báo (từ 1 đến 24, mặc định: 3)',
    }),
    ApiQuery({
      name: 'alpha',
      required: false,
      type: Number,
      example: 0.3,
      description: 'Hệ số làm mượt EMA (từ 0.01 đến 0.99, mặc định: 0.3)',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      example: '2025-01-01',
      description: 'Ngày bắt đầu lọc dữ liệu lịch sử (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      example: '2025-12-31',
      description: 'Ngày kết thúc lọc dữ liệu lịch sử (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'periodType',
      required: false,
      enum: ['month', 'week', 'quarter'],
      example: 'month',
      description: 'Kiểu kỳ dự báo (tháng/tuần/quý, mặc định: month)',
    }),
    ApiQuery({
      name: 'scope',
      required: false,
      enum: ['all', 'sales', 'inventory'],
      example: 'all',
      description:
        'Phạm vi nguồn dữ liệu (all = cả hai, sales = chỉ doanh số, inventory = chỉ tồn kho)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy dự báo kết hợp thành công.',
      schema: {
        example: {
          horizon: 3,
          alpha: 0.3,
          filters: {
            productId: 'P001',
            branchId: '1100',
            plantId: '1201',
            distributionChannel: 'Online',
          },
          sales: {
            source: 'saleReport',
            granularity: 'month',
            observations: 12,
            history: [
              { period: '2026-01-01', value: 1500 },
              { period: '2026-02-01', value: 1800 },
            ],
            ema: {
              alpha: 0.3,
              history: [
                { period: '2026-01-01', value: 1500 },
                { period: '2026-02-01', value: 1590 },
              ],
              forecast: [
                { period: '2026-04-01', value: 1650 },
                { period: '2026-05-01', value: 1650 },
              ],
              lastSmoothedValue: 1650,
            },
            linearRegression: {
              history: [{ period: '2026-01-01', value: 1500 }],
              forecast: [
                { period: '2026-04-01', value: 1900 },
                { period: '2026-05-01', value: 2000 },
              ],
              slope: 95.45,
              intercept: 1400.5,
            },
            chartData: [
              { period: '2026-01-01', value: 1500, type: 'actual', algorithm: 'actual' },
              { period: '2026-04-01', value: 1650, type: 'forecast', algorithm: 'ema' },
            ],
          },
          inventory: {
            source: 'InventoryReport',
            granularity: 'day',
            observations: 20,
            history: [],
            ema: {},
            linearRegression: {},
            chartData: [],
          },
          warnings: ['inventory: No InventoryReport data found for the selected filters'],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
  );
}

export function ApiGetSalesForecastSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy dự báo Doanh số (Sale Report)',
      description:
        'Trả về kết quả dự báo dựa trên dữ liệu bán hàng (SaleReport). ' +
        'Hỗ trợ lọc theo sản phẩm, chi nhánh, kênh phân phối và khoảng thời gian. ' +
        'Sử dụng hai thuật toán EMA và Linear Regression. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiQuery({
      name: 'productId',
      required: false,
      type: String,
      example: 'P001',
      description: 'Lọc theo mã sản phẩm',
    }),
    ApiQuery({
      name: 'branchId',
      required: false,
      type: String,
      example: '1100',
      description: 'Lọc theo mã chi nhánh',
    }),
    ApiQuery({
      name: 'distributionChannel',
      required: false,
      type: String,
      example: 'Online',
      description: 'Lọc theo kênh phân phối',
    }),
    ApiQuery({
      name: 'horizon',
      required: false,
      type: Number,
      example: 3,
      description: 'Số kỳ dự báo (1-24, mặc định: 3)',
    }),
    ApiQuery({
      name: 'alpha',
      required: false,
      type: Number,
      example: 0.3,
      description: 'Hệ số làm mượt EMA (0.01-0.99, mặc định: 0.3)',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      example: '2025-01-01',
      description: 'Ngày bắt đầu (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      example: '2025-12-31',
      description: 'Ngày kết thúc (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'periodType',
      required: false,
      enum: ['month', 'week', 'quarter'],
      example: 'month',
      description: 'Kiểu kỳ (tháng/tuần/quý)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy dự báo doanh số thành công.',
      schema: {
        example: {
          source: 'saleReport',
          granularity: 'month',
          observations: 12,
          history: [{ period: '2026-01-01', value: 1500 }],
          ema: {
            alpha: 0.3,
            history: [],
            forecast: [{ period: '2026-04-01', value: 1650 }],
            lastSmoothedValue: 1650,
          },
          linearRegression: { history: [], forecast: [], slope: 95.45, intercept: 1400.5 },
          chartData: [],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
    ApiResponse({ status: 404, description: 'Không có dữ liệu bán hàng cho bộ lọc đã chọn.' }),
  );
}

export function ApiGetInventoryForecastSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy dự báo Tồn kho (Inventory Report)',
      description:
        'Trả về kết quả dự báo dựa trên dữ liệu tồn kho (InventoryReport). ' +
        'Hỗ trợ lọc theo sản phẩm, nhà máy và khoảng thời gian. ' +
        'Sử dụng hai thuật toán EMA và Linear Regression. ' +
        '**Yêu cầu**: Bearer Token với quyền ADMIN.',
    }),
    ApiQuery({
      name: 'productId',
      required: false,
      type: String,
      example: 'P001',
      description: 'Lọc theo mã sản phẩm',
    }),
    ApiQuery({
      name: 'plantId',
      required: false,
      type: String,
      example: '1201',
      description: 'Lọc theo mã nhà máy',
    }),
    ApiQuery({
      name: 'horizon',
      required: false,
      type: Number,
      example: 3,
      description: 'Số kỳ dự báo (1-24, mặc định: 3)',
    }),
    ApiQuery({
      name: 'alpha',
      required: false,
      type: Number,
      example: 0.3,
      description: 'Hệ số làm mượt EMA (0.01-0.99, mặc định: 0.3)',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: String,
      example: '2025-01-01',
      description: 'Ngày bắt đầu (YYYY-MM-DD)',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: String,
      example: '2025-12-31',
      description: 'Ngày kết thúc (YYYY-MM-DD)',
    }),
    ApiResponse({
      status: 200,
      description: 'Lấy dự báo tồn kho thành công.',
      schema: {
        example: {
          source: 'InventoryReport',
          granularity: 'day',
          observations: 20,
          history: [{ period: '2026-05-01', value: 500 }],
          ema: { alpha: 0.3, history: [], forecast: [], lastSmoothedValue: 500 },
          linearRegression: { history: [], forecast: [], slope: 0, intercept: 500 },
          chartData: [],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ.' }),
    ApiResponse({ status: 403, description: 'Không có quyền ADMIN.' }),
    ApiResponse({ status: 404, description: 'Không có dữ liệu tồn kho cho bộ lọc đã chọn.' }),
  );
}
