import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RowDataPacket } from 'mysql2';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as path from 'path';
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

/* ─── Font paths ─── */
// Works in both dev (ts-node / webpack HMR) and prod (dist/)
function resolveFontDir(): string {
  // In production: process.cwd() = backend root, fonts copied to dist/assets/fonts
  // In dev HMR: src/assets/fonts is used directly
  const candidates = [
    path.join(process.cwd(), 'dist', 'assets', 'fonts'),
    path.join(process.cwd(), 'src', 'assets', 'fonts'),
    path.join(__dirname, '..', '..', 'assets', 'fonts'),
    path.join(__dirname, 'assets', 'fonts'),
  ];
  const fs = require('fs');
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'Arial-Regular.ttf'))) return dir;
  }
  return candidates[1]; // fallback to src
}
const FONT_DIR = resolveFontDir();
const FONT_REGULAR = path.join(FONT_DIR, 'Arial-Regular.ttf');
const FONT_BOLD = path.join(FONT_DIR, 'Arial-Bold.ttf');
const FONT_ITALIC = path.join(FONT_DIR, 'Arial-Italic.ttf');

/* ─── Brand colors ─── */
const COLOR = {
  primary: '#2563EB', // Indigo blue
  primaryDark: '#1E40AF',
  accent: '#0EA5E9', // Sky
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  neutral900: '#0F172A',
  neutral700: '#374151',
  neutral500: '#6B7280',
  neutral300: '#D1D5DB',
  neutral100: '#F3F4F6',
  white: '#FFFFFF',
  pageGutter: 45,
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

  /* ════════════════════════════════════════════
     DATA LOADERS
  ════════════════════════════════════════════ */

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

  private async loadTopProducts(
    query: ReportQueryDto,
    limit: number,
  ): Promise<ITopProductRevenue[]> {
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

  private async loadTopBranches(
    query: ReportQueryDto,
    limit: number,
  ): Promise<ITopBranchRevenue[]> {
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

  /* ════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════ */

  private calculateSummary(monthly: IMonthlyRevenuePoint[]): IGrowthReportData['summary'] {
    const totalRevenue = monthly.reduce((s, r) => s + r.revenue, 0);
    const totalQuantity = monthly.reduce((s, r) => s + r.quantity, 0);
    const currentMonthRevenue = monthly.at(-1)?.revenue ?? 0;
    const previousMonthRevenue = monthly.length > 1 ? (monthly.at(-2)?.revenue ?? 0) : 0;
    const growthPercent =
      previousMonthRevenue > 0
        ? Number(
            (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(
              2,
            ),
          )
        : null;

    return {
      totalRevenue,
      totalQuantity,
      currentMonthRevenue,
      previousMonthRevenue,
      growthPercent,
      averageMonthlyRevenue:
        monthly.length > 0 ? Number((totalRevenue / monthly.length).toFixed(2)) : 0,
      averageMonthlyQuantity:
        monthly.length > 0 ? Number((totalQuantity / monthly.length).toFixed(2)) : 0,
    };
  }

  private resolveMonthRange(
    fromMonth?: string,
    toMonth?: string,
  ): { from: string | null; to: string | null } {
    return {
      from: this.normalizeMonthBoundary(fromMonth, false),
      to: this.normalizeMonthBoundary(toMonth, true),
    };
  }

  private normalizeMonthBoundary(value: string | undefined, endOfMonth: boolean): string | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match)
      throw new NotFoundException(`Định dạng tháng không hợp lệ: '${value}'. Dùng YYYY-MM.`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) throw new NotFoundException(`Tháng không hợp lệ: '${value}'.`);
    const date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    if (endOfMonth) {
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      date.setUTCHours(23, 59, 59, 999);
    }
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private fmtVND(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  private fmtNum(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  private fmtMonth(ym: string): string {
    const [y, m] = ym.split('-');
    return `Tháng ${parseInt(m, 10)}/${y}`;
  }

  private fmtPeriod(from: string | null, to: string | null): string {
    if (!from && !to) return 'Toàn bộ dữ liệu';
    const f = from ? this.fmtMonth(from.slice(0, 7)) : 'Đầu dữ liệu';
    const t = to ? this.fmtMonth(to.slice(0, 7)) : 'Cuối dữ liệu';
    return `${f} – ${t}`;
  }

  private today(): string {
    return new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /* ════════════════════════════════════════════
     PDF PRIMITIVES
  ════════════════════════════════════════════ */

  /** Register fonts and return a new PDFDocument */
  private createDoc(): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: COLOR.pageGutter, size: 'A4', bufferPages: true });
    doc.registerFont('Regular', FONT_REGULAR);
    doc.registerFont('Bold', FONT_BOLD);
    doc.registerFont('Italic', FONT_ITALIC);
    return doc;
  }

  /** Collect all chunks into a buffer */
  private collect(doc: PDFKit.PDFDocument): Promise<Buffer> {
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  /** Full-width cover header banner */
  private drawHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
    const pageWidth = doc.page.width;
    const g = COLOR.pageGutter;

    // Background banner
    doc.rect(0, 0, pageWidth, 120).fill(COLOR.primary);

    // Decorative circles
    doc
      .circle(pageWidth - 60, 20, 55)
      .fillOpacity(0.08)
      .fill(COLOR.white)
      .fillOpacity(1);
    doc
      .circle(pageWidth - 20, 100, 40)
      .fillOpacity(0.06)
      .fill(COLOR.white)
      .fillOpacity(1);
    doc.circle(30, 110, 30).fillOpacity(0.06).fill(COLOR.white).fillOpacity(1);

    // Accent line bottom of banner
    doc.rect(0, 116, pageWidth, 4).fill(COLOR.accent);

    // Title
    doc
      .font('Bold')
      .fontSize(20)
      .fillColor(COLOR.white)
      .text(title, g, 32, { width: pageWidth - g * 2 });

    // Subtitle
    doc
      .font('Regular')
      .fontSize(10)
      .fillColor('rgba(255,255,255,0.80)')
      .text(subtitle, g, 60, { width: pageWidth - g * 2 });

    // Date top-right (inside banner)
    const dateStr = `Ngày xuất: ${this.today()}`;
    doc
      .font('Regular')
      .fontSize(8)
      .fillColor('rgba(255,255,255,0.65)')
      .text(dateStr, g, 98, { width: pageWidth - g * 2, align: 'right' });

    doc.y = 140;
    doc.fillColor(COLOR.neutral900);
  }

  /** Section heading */
  private drawSectionTitle(doc: PDFKit.PDFDocument, text: string) {
    const g = COLOR.pageGutter;
    const pageWidth = doc.page.width;
    const y = doc.y + 8;

    // Left accent bar
    doc.rect(g, y, 4, 16).fill(COLOR.primary);

    // Title text
    doc
      .font('Bold')
      .fontSize(12)
      .fillColor(COLOR.primary)
      .text(text, g + 10, y + 1, { width: pageWidth - g * 2 - 10 });

    // Divider line
    doc
      .moveTo(g, y + 20)
      .lineTo(pageWidth - g, y + 20)
      .lineWidth(0.5)
      .strokeColor(COLOR.neutral300)
      .stroke();

    doc.y = y + 28;
    doc.fillColor(COLOR.neutral900);
  }

  /** KPI summary box row */
  private drawKpiRow(
    doc: PDFKit.PDFDocument,
    items: Array<{ label: string; value: string; color?: string }>,
  ) {
    const g = COLOR.pageGutter;
    const pageWidth = doc.page.width;
    const count = items.length;
    const totalWidth = pageWidth - g * 2;
    const colW = totalWidth / count;
    const boxH = 52;
    const y = doc.y;

    items.forEach((item, i) => {
      const x = g + i * colW;
      const bx = x + 4;
      const bw = colW - 8;

      // Box background
      doc.roundedRect(bx, y, bw, boxH, 6).fill(COLOR.neutral100);
      // Top accent
      doc.rect(bx, y, bw, 3).fill(item.color ?? COLOR.primary);

      // Label
      doc
        .font('Regular')
        .fontSize(7)
        .fillColor(COLOR.neutral500)
        .text(item.label.toUpperCase(), bx + 8, y + 10, { width: bw - 16 });

      // Value
      doc
        .font('Bold')
        .fontSize(11)
        .fillColor(item.color ?? COLOR.neutral900)
        .text(item.value, bx + 8, y + 22, { width: bw - 16, lineBreak: false });
    });

    doc.y = y + boxH + 10;
    doc.fillColor(COLOR.neutral900);
  }

  /** Render a simple table with header + rows */
  private drawTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    colWidths: number[],
  ) {
    const g = COLOR.pageGutter;
    const rowH = 22;
    let y = doc.y;

    // Header row
    doc
      .rect(
        g,
        y,
        colWidths.reduce((a, b) => a + b, 0),
        rowH,
      )
      .fill(COLOR.primary);
    let x = g;
    headers.forEach((h, i) => {
      doc
        .font('Bold')
        .fontSize(8.5)
        .fillColor(COLOR.white)
        .text(h, x + 6, y + 6, { width: colWidths[i] - 12, lineBreak: false });
      x += colWidths[i];
    });
    y += rowH;

    // Data rows
    rows.forEach((row, ri) => {
      const isEven = ri % 2 === 0;
      const totalW = colWidths.reduce((a, b) => a + b, 0);

      // Check page break
      if (y + rowH > doc.page.height - COLOR.pageGutter - 30) {
        doc.addPage();
        y = COLOR.pageGutter + 10;
        // Repeat header
        doc.rect(g, y, totalW, rowH).fill(COLOR.primary);
        let hx = g;
        headers.forEach((h, i) => {
          doc
            .font('Bold')
            .fontSize(8.5)
            .fillColor(COLOR.white)
            .text(h, hx + 6, y + 6, { width: colWidths[i] - 12, lineBreak: false });
          hx += colWidths[i];
        });
        y += rowH;
      }

      doc.rect(g, y, totalW, rowH).fill(isEven ? COLOR.white : COLOR.neutral100);
      let cx = g;
      row.forEach((cell, i) => {
        doc
          .font('Regular')
          .fontSize(8.5)
          .fillColor(COLOR.neutral700)
          .text(cell, cx + 6, y + 6, { width: colWidths[i] - 12, lineBreak: false });
        cx += colWidths[i];
      });

      // Row border
      doc.rect(g, y, totalW, rowH).lineWidth(0.3).strokeColor(COLOR.neutral300).stroke();
      y += rowH;
    });

    doc.y = y + 8;
    doc.fillColor(COLOR.neutral900);
  }

  /** Mini bar chart drawn with PDF primitives */
  private drawBarChart(
    doc: PDFKit.PDFDocument,
    data: IMonthlyRevenuePoint[],
    valueKey: 'revenue' | 'quantity',
    label: string,
  ) {
    if (data.length === 0) return;

    const g = COLOR.pageGutter;
    const pageWidth = doc.page.width;
    const chartW = pageWidth - g * 2;
    const chartH = 80;
    const y = doc.y;

    const maxVal = Math.max(...data.map((d) => d[valueKey]), 1);
    const barW = Math.min(Math.floor((chartW - 20) / data.length) - 4, 40);

    // Chart background
    doc.rect(g, y, chartW, chartH + 30).fill(COLOR.neutral100);
    doc
      .rect(g, y, chartW, chartH + 30)
      .lineWidth(0.5)
      .strokeColor(COLOR.neutral300)
      .stroke();

    // Label
    doc
      .font('Bold')
      .fontSize(8)
      .fillColor(COLOR.neutral500)
      .text(label, g + 8, y + 6, { width: chartW - 16 });

    // Bars
    data.forEach((d, i) => {
      const val = d[valueKey];
      const barH = Math.max(Math.round((val / maxVal) * (chartH - 20)), 2);
      const bx = g + 8 + i * (barW + 4);
      const by = y + chartH - barH + 4;

      // Bar fill with gradient-like effect
      const isLast = i === data.length - 1;
      doc.rect(bx, by, barW, barH).fill(isLast ? COLOR.accent : COLOR.primary);

      // Month label below
      const shortMonth = d.month.slice(5, 7) + '/' + d.month.slice(2, 4);
      doc
        .font('Regular')
        .fontSize(6)
        .fillColor(COLOR.neutral500)
        .text(shortMonth, bx, y + chartH + 8, { width: barW, align: 'center', lineBreak: false });
    });

    doc.y = y + chartH + 36;
    doc.fillColor(COLOR.neutral900);
  }

  /** Footer on each page */
  private drawFooters(doc: PDFKit.PDFDocument, title: string) {
    const pageCount = (doc.bufferedPageRange?.() as any)?.count ?? 1;
    const pageW = doc.page.width;
    const g = COLOR.pageGutter;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      const footerY = doc.page.height - 28;

      doc.rect(0, footerY - 2, pageW, 30).fill(COLOR.neutral100);
      doc
        .moveTo(g, footerY - 2)
        .lineTo(pageW - g, footerY - 2)
        .lineWidth(0.5)
        .strokeColor(COLOR.neutral300)
        .stroke();

      doc
        .font('Regular')
        .fontSize(7)
        .fillColor(COLOR.neutral500)
        .text(title, g, footerY + 6, { width: pageW * 0.6 });

      doc
        .font('Regular')
        .fontSize(7)
        .fillColor(COLOR.neutral500)
        .text(`Trang ${i + 1} / ${pageCount}`, g, footerY + 6, {
          width: pageW - g * 2,
          align: 'right',
        });
    }
  }

  /** Highlighted info callout box */
  private drawCallout(doc: PDFKit.PDFDocument, text: string, color: string = COLOR.primary) {
    const g = COLOR.pageGutter;
    const pageWidth = doc.page.width;
    const boxW = pageWidth - g * 2;
    const y = doc.y;

    doc.roundedRect(g, y, boxW, 34, 5).fill(`${color}15`);
    doc.rect(g, y, 4, 34).fill(color);
    doc
      .font('Regular')
      .fontSize(9)
      .fillColor(COLOR.neutral700)
      .text(text, g + 14, y + 10, { width: boxW - 20 });

    doc.y = y + 44;
  }

  /* ════════════════════════════════════════════
     REVENUE PDF  (chuyên nghiệp)
  ════════════════════════════════════════════ */

  private async renderRevenuePdf(report: IRevenueReportData): Promise<Buffer> {
    const doc = this.createDoc();
    const endPromise = this.collect(doc);
    const period = this.fmtPeriod(report.period.from, report.period.to);
    const growth = report.summary.growthPercent;
    const growthColor =
      growth === null ? COLOR.neutral500 : growth >= 0 ? COLOR.success : COLOR.danger;
    const growthStr =
      growth === null ? 'Không có dữ liệu tháng trước' : `${growth >= 0 ? '+' : ''}${growth}%`;

    /* ─── PAGE 1: HEADER + KPIs ─── */
    this.drawHeader(doc, 'BÁO CÁO DOANH THU HỆ THỐNG', `Kỳ báo cáo: ${period}`);

    // Intro callout
    this.drawCallout(
      doc,
      `Báo cáo tổng hợp tình hình doanh thu toàn hệ thống theo kỳ ${period}. Bao gồm phân tích theo sản phẩm, chi nhánh và biến động tháng.`,
    );

    // KPI row 1
    this.drawSectionTitle(doc, 'Tóm tắt tổng quan');
    this.drawKpiRow(doc, [
      {
        label: 'Tổng Doanh Thu',
        value: this.fmtVND(report.summary.totalRevenue),
        color: COLOR.success,
      },
      {
        label: 'Tổng Số Lượng Bán',
        value: `${this.fmtNum(report.summary.totalQuantity)} sản phẩm`,
      },
      { label: 'Tăng Trưởng MoM', value: growthStr, color: growthColor },
      { label: 'Doanh Thu TB/Tháng', value: this.fmtVND(report.summary.averageMonthlyRevenue) },
    ]);

    // KPI row 2
    this.drawKpiRow(doc, [
      {
        label: 'Doanh Thu Tháng Hiện Tại',
        value: this.fmtVND(report.summary.currentMonthRevenue),
        color: COLOR.primary,
      },
      { label: 'Doanh Thu Tháng Trước', value: this.fmtVND(report.summary.previousMonthRevenue) },
      {
        label: 'SL TB/Tháng',
        value: `${this.fmtNum(Math.round(report.summary.averageMonthlyQuantity))} sp`,
      },
      { label: 'Số Tháng Thống Kê', value: `${report.monthly.length} tháng` },
    ]);

    /* ─── Biểu đồ doanh thu ─── */
    this.drawSectionTitle(doc, 'Biểu đồ doanh thu theo tháng');
    this.drawBarChart(doc, report.monthly, 'revenue', 'Doanh thu (VNĐ)');

    /* ─── PAGE 2: TOP SẢN PHẨM ─── */
    doc.addPage();
    this.drawSectionTitle(doc, `Xếp hạng Top ${report.topProducts.length} sản phẩm theo doanh thu`);

    this.drawTable(
      doc,
      ['#', 'Mã Sản Phẩm', 'Tên / Màu Sắc', 'Số Lượng Bán', 'Doanh Thu'],
      report.topProducts.map((p, i) => [
        String(i + 1),
        p.product_id,
        p.product_name,
        this.fmtNum(p.quantity),
        this.fmtVND(p.revenue),
      ]),
      [30, 100, 180, 90, 110],
    );

    /* ─── TOP CHI NHÁNH ─── */
    this.drawSectionTitle(
      doc,
      `Xếp hạng Top ${report.topBranches.length} chi nhánh theo doanh thu`,
    );

    this.drawTable(
      doc,
      ['#', 'Mã Chi Nhánh', 'Tên Chi Nhánh', 'Số Lượng Bán', 'Doanh Thu'],
      report.topBranches.map((b, i) => [
        String(i + 1),
        b.branch_id,
        b.branch_name,
        this.fmtNum(b.quantity),
        this.fmtVND(b.revenue),
      ]),
      [30, 100, 180, 90, 110],
    );

    /* ─── PAGE 3: CHI TIẾT THÁNG ─── */
    doc.addPage();
    this.drawSectionTitle(doc, 'Chi tiết doanh thu theo từng tháng');
    this.drawBarChart(doc, report.monthly, 'quantity', 'Số lượng bán (chiếc)');

    this.drawTable(
      doc,
      ['Tháng', 'Doanh Thu', 'Số Lượng Bán', 'Tỷ Trọng DT (%)'],
      report.monthly.map((row) => [
        this.fmtMonth(row.month),
        this.fmtVND(row.revenue),
        this.fmtNum(row.quantity),
        report.summary.totalRevenue > 0
          ? `${((row.revenue / report.summary.totalRevenue) * 100).toFixed(1)}%`
          : '0%',
      ]),
      [100, 160, 120, 130],
    );

    /* ─── FOOTER ALL PAGES ─── */
    this.drawFooters(doc, 'BÁO CÁO DOANH THU HỆ THỐNG  |  Bảo mật – Chỉ dành cho nội bộ');

    doc.end();
    return endPromise;
  }

  /* ════════════════════════════════════════════
     GROWTH PDF  (chuyên nghiệp)
  ════════════════════════════════════════════ */

  private async renderGrowthPdf(report: IGrowthReportData): Promise<Buffer> {
    const doc = this.createDoc();
    const endPromise = this.collect(doc);
    const period = this.fmtPeriod(report.period.from, report.period.to);
    const growth = report.summary.growthPercent;
    const growthColor =
      growth === null ? COLOR.neutral500 : growth >= 0 ? COLOR.success : COLOR.danger;
    const growthStr =
      growth === null ? 'Tháng đầu tiên trong kỳ' : `${growth >= 0 ? '+' : ''}${growth}%`;

    /* ─── PAGE 1 ─── */
    this.drawHeader(
      doc,
      'BÁO CÁO TĂNG TRƯỞNG & DỰ BÁO',
      `Kỳ báo cáo: ${period}  •  Phân tích xu hướng & AI/ML Forecasting`,
    );

    this.drawCallout(
      doc,
      `Báo cáo phân tích tốc độ tăng trưởng doanh số kỳ ${period}, so sánh kỳ hiện tại với kỳ liền kề và nhận định xu hướng tăng trưởng của hệ thống.`,
      COLOR.accent,
    );

    /* KPI chính */
    this.drawSectionTitle(doc, 'Các chỉ số tăng trưởng chính');
    this.drawKpiRow(doc, [
      {
        label: 'Tổng Doanh Thu Kỳ',
        value: this.fmtVND(report.summary.totalRevenue),
        color: COLOR.success,
      },
      { label: 'Tăng Trưởng MoM', value: growthStr, color: growthColor },
      {
        label: 'Doanh Thu Tháng Hiện Tại',
        value: this.fmtVND(report.summary.currentMonthRevenue),
        color: COLOR.primary,
      },
      { label: 'Doanh Thu Tháng Trước', value: this.fmtVND(report.summary.previousMonthRevenue) },
    ]);

    this.drawKpiRow(doc, [
      {
        label: 'Tổng Số Lượng Bán',
        value: `${this.fmtNum(report.summary.totalQuantity)} sản phẩm`,
      },
      { label: 'Doanh Thu TB/Tháng', value: this.fmtVND(report.summary.averageMonthlyRevenue) },
      {
        label: 'Số Lượng TB/Tháng',
        value: `${this.fmtNum(Math.round(report.summary.averageMonthlyQuantity))} sp`,
      },
      { label: 'Tổng Số Tháng', value: `${report.monthly.length} tháng` },
    ]);

    /* Điểm nổi bật */
    if (report.highlights.topProduct || report.highlights.topBranch) {
      this.drawSectionTitle(doc, 'Điểm nổi bật kỳ báo cáo');
      if (report.highlights.topProduct) {
        this.drawCallout(
          doc,
          `Sản phẩm đứng đầu: ${report.highlights.topProduct.product_name} (${report.highlights.topProduct.product_id})  –  Doanh thu: ${this.fmtVND(report.highlights.topProduct.revenue)}  –  Số lượng: ${this.fmtNum(report.highlights.topProduct.quantity)} sản phẩm`,
          COLOR.warning,
        );
      }
      if (report.highlights.topBranch) {
        this.drawCallout(
          doc,
          `Chi nhánh dẫn đầu: ${report.highlights.topBranch.branch_name} (${report.highlights.topBranch.branch_id})  –  Doanh thu: ${this.fmtVND(report.highlights.topBranch.revenue)}  –  Số lượng: ${this.fmtNum(report.highlights.topBranch.quantity)} sản phẩm`,
          COLOR.success,
        );
      }
    }

    /* ─── PAGE 2: BIỂU ĐỒ + BẢNG ─── */
    doc.addPage();
    this.drawSectionTitle(doc, 'Xu hướng doanh thu hàng tháng');
    this.drawBarChart(doc, report.monthly, 'revenue', 'Doanh thu (VNĐ)');

    this.drawSectionTitle(doc, 'Xu hướng số lượng bán hàng tháng');
    this.drawBarChart(doc, report.monthly, 'quantity', 'Số lượng (chiếc)');

    this.drawSectionTitle(doc, 'Bảng chi tiết tăng trưởng theo tháng');
    this.drawTable(
      doc,
      ['Tháng', 'Doanh Thu', 'Số Lượng Bán', 'Tăng Trưởng DT', 'Tỷ Trọng (%)'],
      report.monthly.map((row, i) => {
        const prev = i > 0 ? report.monthly[i - 1].revenue : null;
        const delta =
          prev !== null && prev > 0 ? `${(((row.revenue - prev) / prev) * 100).toFixed(1)}%` : '—';
        const share =
          report.summary.totalRevenue > 0
            ? `${((row.revenue / report.summary.totalRevenue) * 100).toFixed(1)}%`
            : '0%';
        return [
          this.fmtMonth(row.month),
          this.fmtVND(row.revenue),
          this.fmtNum(row.quantity),
          delta,
          share,
        ];
      }),
      [85, 140, 100, 95, 90],
    );

    /* ─── NHẬN ĐỊNH (Analytic summary) ─── */
    if (report.monthly.length >= 2) {
      const trend = report.monthly.at(-1)!.revenue - report.monthly[0].revenue;
      const trendStr =
        trend > 0
          ? `Doanh thu có xu hướng TĂNG trong kỳ này, tổng biến động: +${this.fmtVND(trend)} so với tháng đầu kỳ.`
          : trend < 0
            ? `Doanh thu có xu hướng GIẢM trong kỳ này, tổng biến động: ${this.fmtVND(trend)} so với tháng đầu kỳ.`
            : 'Doanh thu ổn định trong toàn kỳ báo cáo.';

      this.drawCallout(
        doc,
        `📊 Nhận định tự động: ${trendStr} Tăng trưởng tháng gần nhất: ${growthStr}.`,
        trend >= 0 ? COLOR.success : COLOR.danger,
      );
    }

    /* ─── FOOTERS ─── */
    this.drawFooters(doc, 'BÁO CÁO TĂNG TRƯỞNG & DỰ BÁO  |  Bảo mật – Chỉ dành cho nội bộ');

    doc.end();
    return endPromise;
  }

  /* ════════════════════════════════════════════
     EXCEL RENDERERS (cũng nâng cấp tiếng Việt)
  ════════════════════════════════════════════ */

  private async renderGrowthExcel(report: IGrowthReportData): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Hệ thống Quản lý Doanh thu';
    wb.created = new Date();

    /* ─ Tóm tắt ─ */
    const wsSummary = wb.addWorksheet('Tóm tắt');
    wsSummary.columns = [
      { key: 'label', width: 36 },
      { key: 'value', width: 28 },
    ];
    this.styleExcelHeader(wsSummary, ['Chỉ số', 'Giá trị'], 2);
    const growth = report.summary.growthPercent;
    const summaryRows = [
      ['Kỳ báo cáo', this.fmtPeriod(report.period.from, report.period.to)],
      ['Tổng doanh thu', report.summary.totalRevenue],
      ['Tổng số lượng bán (chiếc)', report.summary.totalQuantity],
      ['Doanh thu tháng hiện tại', report.summary.currentMonthRevenue],
      ['Doanh thu tháng trước', report.summary.previousMonthRevenue],
      ['Tăng trưởng MoM (%)', growth !== null ? growth : 'Tháng đầu tiên'],
      ['Doanh thu trung bình / tháng', report.summary.averageMonthlyRevenue],
      ['Số lượng trung bình / tháng', Math.round(report.summary.averageMonthlyQuantity)],
      ['Sản phẩm nổi bật', report.highlights.topProduct?.product_name ?? '—'],
      ['Chi nhánh nổi bật', report.highlights.topBranch?.branch_name ?? '—'],
    ];
    summaryRows.forEach((r, i) => {
      const row = wsSummary.addRow(r);
      this.styleExcelDataRow(row, i % 2 === 0);
      if (typeof r[1] === 'number') {
        row.getCell(2).numFmt = '#,##0';
      }
    });

    /* ─ Chi tiết tháng ─ */
    const wsMonthly = wb.addWorksheet('Chi tiết theo tháng');
    wsMonthly.columns = [
      { key: 'month', width: 16, header: 'Tháng' },
      { key: 'revenue', width: 22, header: 'Doanh Thu (VNĐ)' },
      { key: 'quantity', width: 18, header: 'Số Lượng Bán' },
      { key: 'growth', width: 18, header: 'Tăng Trưởng MoM (%)' },
      { key: 'share', width: 18, header: 'Tỷ Trọng DT (%)' },
    ];
    this.styleExcelHeader(
      wsMonthly,
      ['Tháng', 'Doanh Thu (VNĐ)', 'Số Lượng Bán', 'Tăng Trưởng MoM (%)', 'Tỷ Trọng DT (%)'],
      5,
    );
    report.monthly.forEach((r, i) => {
      const prev = i > 0 ? report.monthly[i - 1].revenue : null;
      const delta =
        prev !== null && prev > 0 ? +(((r.revenue - prev) / prev) * 100).toFixed(2) : null;
      const share =
        report.summary.totalRevenue > 0
          ? +((r.revenue / report.summary.totalRevenue) * 100).toFixed(2)
          : 0;
      const row = wsMonthly.addRow([
        this.fmtMonth(r.month),
        r.revenue,
        r.quantity,
        delta ?? '—',
        share,
      ]);
      this.styleExcelDataRow(row, i % 2 === 0);
      row.getCell(2).numFmt = '#,##0';
      row.getCell(3).numFmt = '#,##0';
    });

    const output = await wb.xlsx.writeBuffer();
    return Buffer.from(output);
  }

  private async renderRevenueExcel(report: IRevenueReportData): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Hệ thống Quản lý Doanh thu';
    wb.created = new Date();

    /* ─ Tóm tắt ─ */
    const wsSummary = wb.addWorksheet('Tóm tắt');
    wsSummary.columns = [
      { key: 'label', width: 36 },
      { key: 'value', width: 28 },
    ];
    this.styleExcelHeader(wsSummary, ['Chỉ số', 'Giá trị'], 2);
    const growth = report.summary.growthPercent;
    [
      ['Kỳ báo cáo', this.fmtPeriod(report.period.from, report.period.to)],
      ['Tổng doanh thu (VNĐ)', report.summary.totalRevenue],
      ['Tổng số lượng bán (chiếc)', report.summary.totalQuantity],
      ['Tăng trưởng MoM (%)', growth !== null ? growth : 'Tháng đầu tiên'],
      ['Doanh thu trung bình / tháng (VNĐ)', report.summary.averageMonthlyRevenue],
      ['Số lượng trung bình / tháng (chiếc)', Math.round(report.summary.averageMonthlyQuantity)],
    ].forEach((r, i) => {
      const row = wsSummary.addRow(r);
      this.styleExcelDataRow(row, i % 2 === 0);
      if (typeof r[1] === 'number') row.getCell(2).numFmt = '#,##0';
    });

    /* ─ Chi tiết tháng ─ */
    const wsMonthly = wb.addWorksheet('Doanh thu theo tháng');
    wsMonthly.columns = [
      { key: 'month', width: 16 },
      { key: 'revenue', width: 24 },
      { key: 'quantity', width: 18 },
      { key: 'share', width: 20 },
    ];
    this.styleExcelHeader(
      wsMonthly,
      ['Tháng', 'Doanh Thu (VNĐ)', 'Số Lượng Bán', 'Tỷ Trọng DT (%)'],
      4,
    );
    report.monthly.forEach((r, i) => {
      const share =
        report.summary.totalRevenue > 0
          ? +((r.revenue / report.summary.totalRevenue) * 100).toFixed(2)
          : 0;
      const row = wsMonthly.addRow([this.fmtMonth(r.month), r.revenue, r.quantity, share]);
      this.styleExcelDataRow(row, i % 2 === 0);
      row.getCell(2).numFmt = '#,##0';
      row.getCell(3).numFmt = '#,##0';
    });

    /* ─ Top sản phẩm ─ */
    const wsProducts = wb.addWorksheet('Top Sản Phẩm');
    wsProducts.columns = [
      { key: 'rank', width: 8 },
      { key: 'product_id', width: 20 },
      { key: 'product_name', width: 28 },
      { key: 'quantity', width: 18 },
      { key: 'revenue', width: 24 },
    ];
    this.styleExcelHeader(
      wsProducts,
      ['#', 'Mã Sản Phẩm', 'Tên / Màu Sắc', 'Số Lượng Bán', 'Doanh Thu (VNĐ)'],
      5,
    );
    report.topProducts.forEach((p, i) => {
      const row = wsProducts.addRow([i + 1, p.product_id, p.product_name, p.quantity, p.revenue]);
      this.styleExcelDataRow(row, i % 2 === 0);
      row.getCell(4).numFmt = '#,##0';
      row.getCell(5).numFmt = '#,##0';
    });

    /* ─ Top chi nhánh ─ */
    const wsBranches = wb.addWorksheet('Top Chi Nhánh');
    wsBranches.columns = [
      { key: 'rank', width: 8 },
      { key: 'branch_id', width: 20 },
      { key: 'branch_name', width: 28 },
      { key: 'quantity', width: 18 },
      { key: 'revenue', width: 24 },
    ];
    this.styleExcelHeader(
      wsBranches,
      ['#', 'Mã Chi Nhánh', 'Tên Chi Nhánh', 'Số Lượng Bán', 'Doanh Thu (VNĐ)'],
      5,
    );
    report.topBranches.forEach((b, i) => {
      const row = wsBranches.addRow([i + 1, b.branch_id, b.branch_name, b.quantity, b.revenue]);
      this.styleExcelDataRow(row, i % 2 === 0);
      row.getCell(4).numFmt = '#,##0';
      row.getCell(5).numFmt = '#,##0';
    });

    const output = await wb.xlsx.writeBuffer();
    return Buffer.from(output);
  }

  /* ─── Excel styling helpers ─── */
  private styleExcelHeader(ws: ExcelJS.Worksheet, labels: string[], colCount: number) {
    const headerRow = ws.getRow(1);
    labels.forEach((l, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = l;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF1E40AF' } },
      };
    });
    headerRow.height = 22;
    headerRow.commit();
  }

  private styleExcelDataRow(row: ExcelJS.Row, isEven: boolean) {
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF3F4F6' },
      };
      cell.font = { size: 9, color: { argb: 'FF374151' } };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });
    row.height = 18;
    row.commit();
  }
}
