import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RowDataPacket } from 'mysql2';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { DatabaseService } from 'src/models/database.service';
import { ProductEntity } from 'src/entities/product.entity';
import { StoreBranchEntity } from 'src/entities/branch.entity';
import { ReportQueryDto } from './dto/report-query.dto';
import {
  IGrowthReportData,
  IMonthlyRevenuePoint,
  IRevenueReportData,
  ITopBranchRevenue,
  ITopProductRevenue,
} from './interfaces/report.interface';

type MonthlyRevenueRow = RowDataPacket & {
  month: string;
  revenue: string | number;
  quantity: string | number;
};

type TopRevenueRow = RowDataPacket & {
  id: string;
  name: string;
  quantity: string | number;
  revenue: string | number;
};

@Injectable()
export class ReportsService {
  constructor(
    private readonly db: DatabaseService,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(StoreBranchEntity)
    private readonly storeBranchRepository: Repository<StoreBranchEntity>,
  ) {}

  async buildGrowthReport(query: ReportQueryDto): Promise<IGrowthReportData> {
    const monthly = await this.loadMonthlyRevenue(query);
    if (monthly.length === 0) {
      throw new NotFoundException('Không có dữ liệu saleReport để xuất báo cáo tăng trưởng.');
    }

    const summary = this.calculateSummary(monthly);
    const [topProduct, topBranch] = await Promise.all([
      this.loadTopProducts(query, 1),
      this.loadTopBranches(query, 1),
    ]);

    return {
      period: { from: query.fromMonth ?? null, to: query.toMonth ?? null },
      summary,
      monthly,
      highlights: {
        topProduct: topProduct[0] ?? null,
        topBranch: topBranch[0] ?? null,
      },
    };
  }

  async buildRevenueReport(query: ReportQueryDto): Promise<IRevenueReportData> {
    const [growth, topProducts, topBranches] = await Promise.all([
      this.buildGrowthReport(query),
      this.loadTopProducts(query, query.topN),
      this.loadTopBranches(query, query.topN),
    ]);

    return {
      ...growth,
      topProducts,
      topBranches,
    };
  }

  async exportGrowthPdf(query: ReportQueryDto): Promise<Buffer> {
    const report = await this.buildGrowthReport(query);
    return this.renderGrowthPdf(report);
  }

  async exportGrowthExcel(query: ReportQueryDto): Promise<Buffer> {
    const report = await this.buildGrowthReport(query);
    return this.renderGrowthExcel(report);
  }

  async exportRevenuePdf(query: ReportQueryDto): Promise<Buffer> {
    const report = await this.buildRevenueReport(query);
    return this.renderRevenuePdf(report);
  }

  async exportRevenueExcel(query: ReportQueryDto): Promise<Buffer> {
    const report = await this.buildRevenueReport(query);
    return this.renderRevenueExcel(report);
  }

  private async loadMonthlyRevenue(query: ReportQueryDto): Promise<IMonthlyRevenuePoint[]> {
    const params: Array<string> = [];
    const where: string[] = [];

    const range = this.resolveMonthRange(query.fromMonth, query.toMonth);
    if (range.from) {
      where.push('sr.time_report >= ?');
      params.push(range.from);
    }
    if (range.to) {
      where.push('sr.time_report <= ?');
      params.push(range.to);
    }

    const sql = `
      SELECT DATE_FORMAT(sr.time_report, '%Y-%m') AS month,
             SUM(sr.sold_quantity * p.listing_price) AS revenue,
             SUM(sr.sold_quantity) AS quantity
      FROM saleReport sr
      INNER JOIN product p ON p.product_id = sr.product_id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY DATE_FORMAT(sr.time_report, '%Y-%m')
      ORDER BY month ASC
    `;

    const [rows] = await this.db.client.query<MonthlyRevenueRow[]>(sql, params);

    return rows.map((row) => ({
      month: String(row.month),
      revenue: Number(row.revenue ?? 0),
      quantity: Number(row.quantity ?? 0),
    }));
  }

  private async loadTopProducts(query: ReportQueryDto, limit: number): Promise<ITopProductRevenue[]> {
    const params: Array<string | number> = [];
    const where: string[] = [];
    const range = this.resolveMonthRange(query.fromMonth, query.toMonth);

    if (range.from) {
      where.push('sr.time_report >= ?');
      params.push(range.from);
    }
    if (range.to) {
      where.push('sr.time_report <= ?');
      params.push(range.to);
    }

    params.push(limit);

    const sql = `
      SELECT sr.product_id AS id,
             COALESCE(p.color, sr.product_id) AS name,
             SUM(sr.sold_quantity) AS quantity,
             SUM(sr.sold_quantity * p.listing_price) AS revenue
      FROM saleReport sr
      INNER JOIN product p ON p.product_id = sr.product_id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY sr.product_id, p.color
      ORDER BY revenue DESC
      LIMIT ?
    `;

    const [rows] = await this.db.client.query<TopRevenueRow[]>(sql, params);

    return rows.map((row) => ({
      product_id: String(row.id),
      product_name: String(row.name),
      quantity: Number(row.quantity ?? 0),
      revenue: Number(row.revenue ?? 0),
    }));
  }

  private async loadTopBranches(query: ReportQueryDto, limit: number): Promise<ITopBranchRevenue[]> {
    const params: Array<string | number> = [];
    const where: string[] = [];
    const range = this.resolveMonthRange(query.fromMonth, query.toMonth);

    if (range.from) {
      where.push('sr.time_report >= ?');
      params.push(range.from);
    }
    if (range.to) {
      where.push('sr.time_report <= ?');
      params.push(range.to);
    }

    params.push(limit);

    const sql = `
      SELECT sr.branch_id AS id,
             COALESCE(sb.name, sr.branch_id) AS name,
             SUM(sr.sold_quantity) AS quantity,
             SUM(sr.sold_quantity * p.listing_price) AS revenue
      FROM saleReport sr
      INNER JOIN product p ON p.product_id = sr.product_id
      LEFT JOIN storeBranch sb ON sb.store_id = sr.branch_id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY sr.branch_id, sb.name
      ORDER BY revenue DESC
      LIMIT ?
    `;

    const [rows] = await this.db.client.query<TopRevenueRow[]>(sql, params);

    return rows.map((row) => ({
      branch_id: String(row.id),
      branch_name: String(row.name),
      quantity: Number(row.quantity ?? 0),
      revenue: Number(row.revenue ?? 0),
    }));
  }

  private calculateSummary(monthly: IMonthlyRevenuePoint[]): IGrowthReportData['summary'] {
    const totalRevenue = monthly.reduce((sum, row) => sum + row.revenue, 0);
    const totalQuantity = monthly.reduce((sum, row) => sum + row.quantity, 0);
    const currentMonthRevenue = monthly.at(-1)?.revenue ?? 0;
    const previousMonthRevenue = monthly.length > 1 ? monthly.at(-2)?.revenue ?? 0 : 0;
    const growthPercent =
      previousMonthRevenue > 0
        ? Number((((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(2))
        : null;

    return {
      totalRevenue,
      totalQuantity,
      currentMonthRevenue,
      previousMonthRevenue,
      growthPercent,
      averageMonthlyRevenue: monthly.length > 0 ? Number((totalRevenue / monthly.length).toFixed(2)) : 0,
      averageMonthlyQuantity: monthly.length > 0 ? Number((totalQuantity / monthly.length).toFixed(2)) : 0,
    };
  }

  private resolveMonthRange(
    fromMonth?: string,
    toMonth?: string,
  ): { from: string | null; to: string | null } {
    const from = this.normalizeMonthBoundary(fromMonth, false);
    const to = this.normalizeMonthBoundary(toMonth, true);
    return { from, to };
  }

  private normalizeMonthBoundary(value: string | undefined, endOfMonth: boolean): string | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) {
      throw new NotFoundException(`Định dạng tháng không hợp lệ: '${value}'. Dùng YYYY-MM.`);
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) {
      throw new NotFoundException(`Định dạng tháng không hợp lệ: '${value}'. Dùng YYYY-MM.`);
    }

    const date = new Date(Date.UTC(year, month - 1, endOfMonth ? 1 : 1, 0, 0, 0));
    if (endOfMonth) {
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      date.setUTCHours(23, 59, 59, 999);
    }
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  private async renderGrowthPdf(report: IGrowthReportData): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

    const endPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(18).text('Bao cao tang truong he thong', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Ky bao cao: ${report.period.from ?? 'dau du lieu'} -> ${report.period.to ?? 'cuoi du lieu'}`);
    doc.text(`Tong doanh thu: ${this.formatNumber(report.summary.totalRevenue)} VNĐ`);
    doc.text(`Tong so luong ban: ${this.formatNumber(report.summary.totalQuantity)} chiec`);
    doc.text(`Doanh thu thang hien tai: ${this.formatNumber(report.summary.currentMonthRevenue)} VNĐ`);
    doc.text(`Doanh thu thang truoc: ${this.formatNumber(report.summary.previousMonthRevenue)} VNĐ`);
    doc.text(`Tang truong MoM: ${report.summary.growthPercent ?? 0}%`);
    doc.text(`Trung binh doanh thu thang: ${this.formatNumber(report.summary.averageMonthlyRevenue)} VNĐ`);
    doc.text(`Trung binh so luong thang: ${this.formatNumber(report.summary.averageMonthlyQuantity)} chiec`);

    doc.moveDown();
    doc.fontSize(13).text('Top noi bat', { underline: true });
    doc.fontSize(11).text(
      `San pham top 1: ${report.highlights.topProduct?.product_name ?? '-'} (${report.highlights.topProduct?.product_id ?? '-'})`,
    );
    doc.text(
      `Chi nhanh top 1: ${report.highlights.topBranch?.branch_name ?? '-'} (${report.highlights.topBranch?.branch_id ?? '-'})`,
    );

    doc.moveDown();
    doc.fontSize(13).text('Doanh thu theo thang', { underline: true });
    report.monthly.forEach((row) => {
      doc.fontSize(10).text(
        `${row.month}: ${this.formatNumber(row.revenue)} VNĐ, ${this.formatNumber(row.quantity)} chiec`,
      );
    });

    doc.end();
    return endPromise;
  }

  private async renderGrowthExcel(report: IGrowthReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const wsSummary = workbook.addWorksheet('Summary');
    const wsMonthly = workbook.addWorksheet('Monthly');

    wsSummary.addRows([
      ['Ky bao cao', `${report.period.from ?? 'dau du lieu'} -> ${report.period.to ?? 'cuoi du lieu'}`],
      ['Tong doanh thu', report.summary.totalRevenue],
      ['Tong so luong ban', report.summary.totalQuantity],
      ['Doanh thu thang hien tai', report.summary.currentMonthRevenue],
      ['Doanh thu thang truoc', report.summary.previousMonthRevenue],
      ['Tang truong MoM (%)', report.summary.growthPercent ?? 0],
      ['Trung binh doanh thu thang', report.summary.averageMonthlyRevenue],
      ['Trung binh so luong thang', report.summary.averageMonthlyQuantity],
    ]);

    wsMonthly.columns = [
      { header: 'Month', key: 'month', width: 14 },
      { header: 'Revenue', key: 'revenue', width: 18 },
      { header: 'Quantity', key: 'quantity', width: 12 },
    ];
    wsMonthly.addRows(report.monthly);

    const output = await workbook.xlsx.writeBuffer();
    return Buffer.from(output as ArrayBuffer);
  }

  private async renderRevenuePdf(report: IRevenueReportData): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));

    const endPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(18).text('Bao cao doanh thu he thong', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Ky bao cao: ${report.period.from ?? 'dau du lieu'} -> ${report.period.to ?? 'cuoi du lieu'}`);
    doc.text(`Tong doanh thu: ${this.formatNumber(report.summary.totalRevenue)} VNĐ`);
    doc.text(`Tong so luong ban: ${this.formatNumber(report.summary.totalQuantity)} chiec`);
    doc.text(`Tang truong MoM: ${report.summary.growthPercent ?? 0}%`);

    doc.moveDown();
    doc.fontSize(13).text('Top san pham', { underline: true });
    report.topProducts.forEach((item, index) => {
      doc.fontSize(10).text(
        `${index + 1}. ${item.product_name} (${item.product_id}) - ${this.formatNumber(item.revenue)} VNĐ, ${this.formatNumber(item.quantity)} chiec`,
      );
    });

    doc.moveDown();
    doc.fontSize(13).text('Top chi nhanh', { underline: true });
    report.topBranches.forEach((item, index) => {
      doc.fontSize(10).text(
        `${index + 1}. ${item.branch_name} (${item.branch_id}) - ${this.formatNumber(item.revenue)} VNĐ, ${this.formatNumber(item.quantity)} chiec`,
      );
    });

    doc.moveDown();
    doc.fontSize(13).text('Doanh thu theo thang', { underline: true });
    report.monthly.forEach((row) => {
      doc.fontSize(10).text(
        `${row.month}: ${this.formatNumber(row.revenue)} VNĐ, ${this.formatNumber(row.quantity)} chiec`,
      );
    });

    doc.end();
    return endPromise;
  }

  private async renderRevenueExcel(report: IRevenueReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const wsSummary = workbook.addWorksheet('Summary');
    const wsMonthly = workbook.addWorksheet('Monthly');
    const wsProducts = workbook.addWorksheet('Top Products');
    const wsBranches = workbook.addWorksheet('Top Branches');

    wsSummary.addRows([
      ['Ky bao cao', `${report.period.from ?? 'dau du lieu'} -> ${report.period.to ?? 'cuoi du lieu'}`],
      ['Tong doanh thu', report.summary.totalRevenue],
      ['Tong so luong ban', report.summary.totalQuantity],
      ['Doanh thu thang hien tai', report.summary.currentMonthRevenue],
      ['Doanh thu thang truoc', report.summary.previousMonthRevenue],
      ['Tang truong MoM (%)', report.summary.growthPercent ?? 0],
      ['Trung binh doanh thu thang', report.summary.averageMonthlyRevenue],
      ['Trung binh so luong thang', report.summary.averageMonthlyQuantity],
    ]);

    wsMonthly.columns = [
      { header: 'Month', key: 'month', width: 14 },
      { header: 'Revenue', key: 'revenue', width: 18 },
      { header: 'Quantity', key: 'quantity', width: 12 },
    ];
    wsMonthly.addRows(report.monthly);

    wsProducts.columns = [
      { header: 'Product ID', key: 'product_id', width: 18 },
      { header: 'Product Name', key: 'product_name', width: 24 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Revenue', key: 'revenue', width: 18 },
    ];
    wsProducts.addRows(report.topProducts);

    wsBranches.columns = [
      { header: 'Branch ID', key: 'branch_id', width: 18 },
      { header: 'Branch Name', key: 'branch_name', width: 24 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Revenue', key: 'revenue', width: 18 },
    ];
    wsBranches.addRows(report.topBranches);

    const output = await workbook.xlsx.writeBuffer();
    return Buffer.from(output as ArrayBuffer);
  }
}
