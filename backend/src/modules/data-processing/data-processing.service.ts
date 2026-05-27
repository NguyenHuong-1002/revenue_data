import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../models/database.service';
import * as Excel from 'exceljs';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CleanedProduct } from './interfaces/data.interface';

// Function check giá trị đầu vào val == null thì trả về chuỗi rỗng , còn lại ép kiểu về string
// sử dụng toán tử == <so sánh lỏng> để bắt value underfine và null
function safeString(value: unknown): string {
  return value == null ? '' : String(value);
}

// Function helps check giá trị đầu vào thành string (nếu ép kiểu khác number => trả về NaN)
function safeNumber(value: unknown): number | null {
  // 1. Nếu là null, undefined, hoặc chuỗi rỗng (kể cả chứa toàn dấu cách) -> Trả về null
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // 2. Ép kiểu về số
  const num = Number(value);

  // 3. Nếu ép kiểu thất bại (ra NaN, ví dụ do input là chữ "abc") -> Trả về null
  // Nếu thành công (bao gồm cả số 0 hợp lệ) -> Trả về chính số đó
  return Number.isNaN(num) ? null : num;
}

const s = safeString;
const n = safeNumber;

// Hàm gộp: Vừa chống crash code, vừa kiểm tra nội dung rác
function isValidProductString(value: any): boolean {
  // 1. Chặn ngay null/undefined (Thay thế cho safeString)
  if (value == null) return false;

  // 2. Ép kiểu về string và dọn dẹp khoảng trắng
  const cleaned = String(value).trim().toLowerCase();

  // 3. Kiểm tra nội dung rác
  if (!cleaned) return false;
  if (cleaned === 'n/a' || cleaned === 'na') return false;
  if (cleaned === 'null' || cleaned === 'undefined') return false;

  return true;
}
@Injectable()
export class DataProcessingService {
  private readonly logger = new Logger(DataProcessingService.name);
  private readonly dataDir = path.resolve(__dirname, '../../../../data');

  // eslint-disable-next-line prettier/prettier
  constructor(private readonly db: DatabaseService) { }

  private async isTableEmpty(table: string): Promise<boolean> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM ${table}`,
    );
    return Number(rows[0].cnt) === 0;
  }

  // ───────────────────────────
  //  Data Transform Functions (Dựa theo Entity)
  // ───────────────────────────

  /**
   * 1. Hàm xử lý dữ liệu đầu vào cho thực thể Sản phẩm (ProductEntity)
   * Lấy ra và chuẩn hóa các trường thông tin dựa trên cấu hình Entity tương ứng.
   */
  transformProductData(row: Record<string, any>) {
    return {
      product_id: s(row['product_id']),
      color: s(row['color']),
      listing_price: n(row['listing_price']),
      price_cost: n(row['cost_price']), // Lưu ý: Cột Excel thô là cost_price, ánh xạ sang price_cost trong DB
      gender: s(row['gender']),
      detail_product_group: s(row['detail_product_group']),
      size: s(row['size']),
      age_group: s(row['age_group']),
      activity_group: s(row['activity_group']),
      lifestyle_group: s(row['lifestyle_group']),
    };
  }

  /**
   * 2. Hàm xử lý dữ liệu đầu vào cho thực thể Báo cáo Bán hàng (SaleReportEntity)
   * Lấy ra và chuẩn hóa các trường thông tin dựa trên cấu hình Entity tương ứng.
   */
  transformSaleReportData(row: Record<string, any>) {
    return {
      sale_id: this.generateId('SALE'),
      product_id: s(row['product_id']),
      customer_id: s(row['customer_id']),
      sold_quantity: n(row['sold_quantity']),
      distribution_channel: s(row['distribution_channel']),
      branch_id: s(row['branch_id']),
      time_report: new Date(),
    };
  }

  /**
   * 3. Hàm xử lý dữ liệu đầu vào cho thực thể Báo cáo Tồn kho (InventoryReportEntity)
   * Lấy ra và chuẩn hóa các trường thông tin dựa trên cấu hình Entity tương ứng.
   */
  transformInventoryReportData(row: Record<string, any>) {
    const dateStr = s(row['calendar_year_week']);
    return {
      inventory_id: this.generateId('INV'),
      product_id: s(row['product_id']),
      plant_id: s(row['plant']), // Lưu ý: Cột Excel thô là plant, ánh xạ sang plant_id trong DB
      calendar_year_week: this.parseDate(dateStr),
      quantity: n(row['quantity']),
    };
  }

  // ───────────────────────────
  //  Product Import
  // ───────────────────────────
  async importProducts(
    filePath?: string,
  ): Promise<{ total: number; inserted: number }> {
    if (!(await this.isTableEmpty('product'))) {
      this.logger.log('Product table already has data, skipping import');
      return { total: 0, inserted: 0 };
    }
    const fp =
      filePath ?? path.join(this.dataDir, 'product', 'Productmaster.xlsx');
    const rows = await this.readExcel(fp);
    let inserted = 0;

    for (const row of rows) {
      try {
        const cleaned = this.transformProductData(row);

        await this.db.client.query<ResultSetHeader>(
          `INSERT INTO product (product_id, color, listing_price, price_cost, gender, detail_product_group, size, age_group, activity_group, lifestyle_group)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             color = VALUES(color),
             listing_price = VALUES(listing_price),
             price_cost = VALUES(price_cost),
             gender = VALUES(gender),
             detail_product_group = VALUES(detail_product_group),
             size = VALUES(size),
             age_group = VALUES(age_group),
             activity_group = VALUES(activity_group),
             lifestyle_group = VALUES(lifestyle_group)`,
          [
            cleaned.product_id,
            cleaned.color,
            cleaned.listing_price,
            cleaned.price_cost,
            cleaned.gender,
            cleaned.detail_product_group,
            cleaned.size,
            cleaned.age_group,
            cleaned.activity_group,
            cleaned.lifestyle_group,
          ],
        );
        inserted++;
      } catch (err) {
        this.logger.warn(`Skip product row: ${(err as Error).message}`);
      }
    }
    this.logger.log(`Imported ${inserted}/${rows.length} products`);
    return { total: rows.length, inserted };
  }

  // ───────────────────────────
  //  SaleReport Import
  // ───────────────────────────
  async importSaleReports(
    filePaths?: string[],
  ): Promise<{ total: number; inserted: number }> {
    if (!(await this.isTableEmpty('saleReport'))) {
      this.logger.log('saleReport table already has data, skipping import');
      return { total: 0, inserted: 0 };
    }
    const dir = path.join(this.dataDir, 'sales');
    const files = filePaths ?? this.listExcelFiles(dir);
    let total = 0;
    let inserted = 0;

    for (const file of files) {
      const fp = path.join(dir, file);
      const rows = await this.readExcel(fp);
      total += rows.length;

      for (const row of rows) {
        try {
          const cleaned = this.transformSaleReportData(row);

          await this.ensureCustomer(cleaned.customer_id);
          await this.ensureStoreBranch(cleaned.branch_id);

          await this.db.client.query<ResultSetHeader>(
            `INSERT INTO saleReport (sale_id, product_id, customer_id, sold_quantity, distribution_channel, branch_id, time_report)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               sold_quantity = VALUES(sold_quantity),
               distribution_channel = VALUES(distribution_channel)`,
            [
              cleaned.sale_id,
              cleaned.product_id,
              cleaned.customer_id,
              cleaned.sold_quantity,
              cleaned.distribution_channel,
              cleaned.branch_id,
              cleaned.time_report,
            ],
          );
          inserted++;
        } catch (err) {
          this.logger.warn(
            `Skip sale row in ${file}: ${(err as Error).message}`,
          );
        }
      }
      this.logger.log(`Imported ${rows.length} rows from ${file}`);
    }
    this.logger.log(`Imported ${inserted}/${total} sale records`);
    return { total, inserted };
  }

  // ───────────────────────────
  //  InventoryReport Import
  // ───────────────────────────
  async importInventoryReports(
    filePaths?: string[],
  ): Promise<{ total: number; inserted: number }> {
    if (!(await this.isTableEmpty('InventoryReport'))) {
      this.logger.log(
        'InventoryReport table already has data, skipping import',
      );
      return { total: 0, inserted: 0 };
    }
    const dir = path.join(this.dataDir, 'inventorys');
    const files = filePaths ?? this.listExcelFiles(dir);
    let total = 0;
    let inserted = 0;

    for (const file of files) {
      const fp = path.join(dir, file);
      const rows = await this.readExcel(fp);
      total += rows.length;

      for (const row of rows) {
        try {
          const cleaned = this.transformInventoryReportData(row);

          await this.ensurePlant(cleaned.plant_id);

          await this.db.client.query<ResultSetHeader>(
            `INSERT INTO InventoryReport (inventory_id, product_id, plant_id, calendar_year_week, quantity)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               quantity = VALUES(quantity)`,
            [
              cleaned.inventory_id,
              cleaned.product_id,
              cleaned.plant_id,
              cleaned.calendar_year_week,
              cleaned.quantity,
            ],
          );
          inserted++;
        } catch (err) {
          this.logger.warn(
            `Skip inventory row in ${file}: ${(err as Error).message}`,
          );
        }
      }
      this.logger.log(`Imported ${rows.length} rows from ${file}`);
    }
    this.logger.log(`Imported ${inserted}/${total} inventory records`);
    return { total, inserted };
  }

  // ───────────────────────────
  //  Import all
  // ───────────────────────────
  async importAll(): Promise<{
    product: { total: number; inserted: number };
    sale: { total: number; inserted: number };
    inventory: { total: number; inserted: number };
  }> {
    const product = await this.importProducts();
    const sale = await this.importSaleReports();
    const inventory = await this.importInventoryReports();
    return { product, sale, inventory };
  }

  // ───────────────────────────
  //  Helpers
  // ───────────────────────────
  private async readExcel(
    filePath: string,
  ): Promise<Record<string, unknown>[]> {
    const wb = new Excel.Workbook();
    await wb.xlsx.readFile(filePath);
    const ws = wb.worksheets[0];
    const rows: Record<string, unknown>[] = [];
    const headerRow = ws.getRow(1).values as (string | null)[];

    const headers: string[] = [];
    for (let i = 3; i < headerRow.length; i++) {
      headers.push(String(headerRow[i] ?? ''));
    }

    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const obj: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        const key = h.trim();
        const colIdx = idx + 3;
        if (key) obj[key] = row.values[colIdx];
      });
      if (Object.keys(obj).length > 0) rows.push(obj);
    });

    return rows;
  }

  private listExcelFiles(dir: string): string[] {
    return fs.readdirSync(dir).filter((f) => f.endsWith('.xlsx'));
  }

  private generateId(prefix: string): string {
    const rand = Math.random().toString(36).substring(2, 10);
    const ts = Date.now().toString(36);
    return `${prefix}_${ts}${rand}`;
  }

  private parseAgeGroup(val: string): number {
    if (!val) return 0;
    const match = String(val).match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  private parseDate(dateStr: string): string | null {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;
    if (/^\d{8}$/.test(dateStr)) {
      const y = dateStr.substring(0, 4);
      const m = dateStr.substring(4, 6);
      const d = dateStr.substring(6, 8);
      return `${y}-${m}-${d} 00:00:00`;
    }
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime())
      ? null
      : d.toISOString().slice(0, 19).replace('T', ' ');
  }

  private async ensureCustomer(customerId: string): Promise<void> {
    await this.db.client.query<ResultSetHeader>(
      `INSERT IGNORE INTO customer (customer_id) VALUES (?)`,
      [customerId],
    );
  }

  private async ensureStoreBranch(branchId: string): Promise<void> {
    await this.db.client.query<ResultSetHeader>(
      `INSERT IGNORE INTO storeBranch (store_id, name) VALUES (?, ?)`,
      [branchId, branchId],
    );
  }

  private async ensurePlant(plantId: string): Promise<void> {
    await this.db.client.query<ResultSetHeader>(
      `INSERT IGNORE INTO Plant (plant_id, name_plant) VALUES (?, ?)`,
      [plantId, plantId],
    );
  }
}
