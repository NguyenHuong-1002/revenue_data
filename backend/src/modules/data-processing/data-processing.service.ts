import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../models/database.service';
import * as path from 'node:path';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import {
  CleanedProduct,
  CleanedSaleReport,
  CleanedInventoryReport,
  TransformResult,
  ImportResult,
  FieldStats,
} from './interfaces/data.interface';
import {
  safeString,
  safeNumber,
  isValidProductString as isValidProduct,
  generateId,
  parseDate,
  parseMonthToDateStr,
  normalizeDistributionChannel,
  normalizeGender,
  normalizeAgeGroup,
  normalizeActivityGroup,
} from './utils/validation.util';
import { readExcel, listExcelFiles } from './utils/excel-reader.util';

const s = safeString;
const n = safeNumber;

@Injectable()
export class DataProcessingService {
  private readonly logger = new Logger(DataProcessingService.name);
  private readonly dataDir = path.resolve(__dirname, '../../../../data');
  private readonly batchSize = 500;

  constructor(private readonly db: DatabaseService) { }

  private async isTableEmpty(table: string): Promise<boolean> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM ${table}`,
    );
    return Number(rows[0].cnt) === 0;
  }

  private chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  }

  private async bulkInsertIgnore(
    table: string,
    columns: string[],
    rows: (string | number | null)[][],
  ): Promise<void> {
    if (rows.length === 0) {
      return;
    }

    const columnList = columns.join(', ');
    const rowPlaceholders = `(${columns.map(() => '?').join(', ')})`;

    for (const batch of this.chunk(rows, this.batchSize)) {
      const placeholders = batch.map(() => rowPlaceholders).join(', ');
      const values = batch.flat();
      await this.db.client.query(
        `INSERT IGNORE INTO ${table} (${columnList}) VALUES ${placeholders}`,
        values,
      );
    }
  }

  private async loadExistingProductIds(): Promise<Set<string>> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(`SELECT product_id FROM product`);
    return new Set(rows.map((row) => String(row.product_id)));
  }

  // ───────────────────────────
  //  Data Transform Functions (Dựa theo Entity)
  // ───────────────────────────

  /**
   * 1. Hàm xử lý dữ liệu đầu vào cho thực thể Sản phẩm (ProductEntity)
   * Lấy ra và chuẩn hóa các trường thông tin dựa trên cấu hình Entity tương ứng.
   * Đồng thời lọc rác các giá trị null, undefined, n/a qua isValidProduct
   */
  transformProductData(row: Record<string, unknown>): TransformResult<CleanedProduct> {
    const product_id = s(row['product_id']);
    const color = s(row['color']);
    const listing_price = n(row['listing_price']);
    const price_cost = n(row['cost_price']);
    const gender = normalizeGender(s(row['gender']));
    const detail_product_group = s(row['detail_product_group']);
    const size = n(row['size']);
    const age_group = normalizeAgeGroup(s(row['age_group']));
    const activity_group = normalizeActivityGroup(s(row['activity_group']));
    const lifestyle_group = s(row['lifestyle_group']);

    const acceptedFields: string[] = [];
    const rejectedFields: string[] = [];
    const errorDetails: Record<string, string> = {};

    if (isValidProduct(product_id)) {
      acceptedFields.push('product_id');
    } else {
      rejectedFields.push('product_id');
      errorDetails['product_id'] = `Trống hoặc chứa giá trị không hợp lệ: '${row['product_id']}'`;
    }

    if (isValidProduct(color)) {
      acceptedFields.push('color');
    } else {
      rejectedFields.push('color');
      errorDetails['color'] = `Trống hoặc chứa giá trị không hợp lệ: '${row['color']}'`;
    }

    if (listing_price !== null) {
      acceptedFields.push('listing_price');
    } else {
      rejectedFields.push('listing_price');
      errorDetails['listing_price'] =
        `Trống hoặc không phải là số hợp lệ: '${row['listing_price']}'`;
    }

    if (price_cost !== null) {
      acceptedFields.push('price_cost');
    } else {
      rejectedFields.push('price_cost');
      errorDetails['price_cost'] = `Trống hoặc không phải là số hợp lệ: '${row['cost_price']}'`;
    }

    if (isValidProduct(gender)) {
      acceptedFields.push('gender');
    } else {
      rejectedFields.push('gender');
      errorDetails['gender'] = `Trống hoặc chứa giá trị không hợp lệ: '${row['gender']}'`;
    }

    if (isValidProduct(detail_product_group)) {
      acceptedFields.push('detail_product_group');
    } else {
      rejectedFields.push('detail_product_group');
      errorDetails['detail_product_group'] =
        `Trống hoặc chứa giá trị không hợp lệ: '${row['detail_product_group']}'`;
    }

    if (size !== null) {
      acceptedFields.push('size');
    } else {
      rejectedFields.push('size');
      errorDetails['size'] = `Trống hoặc không phải là số hợp lệ: '${row['size']}'`;
    }

    if (isValidProduct(age_group)) {
      acceptedFields.push('age_group');
    } else {
      rejectedFields.push('age_group');
      errorDetails['age_group'] = `Trống hoặc chứa giá trị không hợp lệ: '${row['age_group']}'`;
    }

    if (isValidProduct(activity_group)) {
      acceptedFields.push('activity_group');
    } else {
      rejectedFields.push('activity_group');
      errorDetails['activity_group'] =
        `Trống hoặc chứa giá trị không hợp lệ: '${row['activity_group']}'`;
    }

    if (isValidProduct(lifestyle_group)) {
      acceptedFields.push('lifestyle_group');
    } else {
      rejectedFields.push('lifestyle_group');
      errorDetails['lifestyle_group'] =
        `Trống hoặc chứa giá trị không hợp lệ: '${row['lifestyle_group']}'`;
    }

    const data: CleanedProduct = {
      product_id,
      color,
      listing_price: listing_price as number,
      price_cost: price_cost as number,
      gender,
      detail_product_group,
      size: size as number,
      age_group,
      activity_group,
      lifestyle_group,
    };

    return {
      data,
      acceptedFields,
      rejectedFields,
      errorDetails,
    };
  }

  /**
   * 2. Hàm xử lý dữ liệu đầu vào cho thực thể Báo cáo Bán hàng (SaleReportEntity)
   * Lấy ra và chuẩn hóa các trường thông tin dựa trên cấu hình Entity tương ứng.
   * Đồng thời lọc rác các giá trị null, undefined, n/a qua isValidProduct
   */
  transformSaleReportData(row: Record<string, any>): CleanedSaleReport | null {
    const product_id = s(row['product_id']);
    const sold_quantity = n(row['sold_quantity']);
    const distribution_channel = normalizeDistributionChannel(s(row['distribution_channel']));
    const branch_id = s(row['branch_id']);
    const monthVal = s(row['month']);

    const missing: string[] = [];
    if (!isValidProduct(product_id)) missing.push(`product_id ('${row['product_id']}')`);
    if (sold_quantity === null) missing.push(`sold_quantity ('${row['sold_quantity']}')`);
    if (!isValidProduct(distribution_channel))
      missing.push(`distribution_channel ('${row['distribution_channel']}')`);
    if (!isValidProduct(branch_id)) missing.push(`branch_id ('${row['branch_id']}')`);
    if (!isValidProduct(monthVal)) missing.push(`month ('${row['month']}')`);

    if (missing.length > 0) {
      throw new Error(
        `Dữ liệu không hợp lệ. Chi tiết thiếu hoặc sai định dạng: ${missing.join(', ')}`,
      );
    }

    const time_report = parseMonthToDateStr(monthVal);

    return {
      sale_id: uuidv4(),
      product_id,
      sold_quantity: sold_quantity as number,
      distribution_channel,
      branch_id,
      time_report,
    };
  }

  /**
   * 3. Hàm xử lý dữ liệu đầu vào cho thực thể Báo cáo Tồn kho (InventoryReportEntity)
   * Lấy ra và chuẩn hóa các trường thông tin dựa trên cấu hình Entity tương ứng.
   * Đồng thời lọc rác các giá trị null, undefined, n/a qua isValidProduct
   */
  transformInventoryReportData(row: Record<string, any>): CleanedInventoryReport | null {
    const dateStr = s(row['calendar_yeer_week'] ?? row['calendar_year_week']);
    const product_id = s(row['product_id']);
    const plant_id = s(row['plant']);
    const calendar_year_week = parseDate(dateStr);
    const quantity = n(row['quantity']);

    const missing: string[] = [];
    if (!isValidProduct(product_id)) missing.push(`product_id ('${row['product_id']}')`);
    if (!isValidProduct(plant_id)) missing.push(`plant ('${row['plant']}')`);
    if (!calendar_year_week) missing.push(`calendar_year_week / calendar_yeer_week ('${dateStr}')`);
    if (quantity === null) missing.push(`quantity ('${row['quantity']}')`);

    if (missing.length > 0) {
      throw new Error(
        `Dữ liệu không hợp lệ. Chi tiết thiếu hoặc sai định dạng: ${missing.join(', ')}`,
      );
    }

    return {
      inventory_id: uuidv4(),
      product_id,
      plant_id,
      calendar_year_week,
      quantity,
    };
  }

  // ───────────────────────────
  //  Product Import
  // ───────────────────────────
  async importProducts(
    filePath?: string | Buffer,
    bypassEmptyCheck = false,
  ): Promise<ImportResult> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty('product'))) {
      this.logger.log('Product table already has data, skipping import');
      return { total: 0, inserted: 0, skipped: 0, fieldStats: {} };
    }
    let rows: Record<string, any>[];
    if (Buffer.isBuffer(filePath)) {
      rows = await readExcel(filePath);
    } else {
      const fp = filePath ?? path.join(this.dataDir, 'product', 'Productmaster.xlsx');
      rows = await readExcel(fp);
    }

    const validProducts: CleanedProduct[] = [];
    let skipped = 0;

    const fieldStats: FieldStats = {
      product_id: { accepted: 0, rejected: 0 },
      color: { accepted: 0, rejected: 0 },
      listing_price: { accepted: 0, rejected: 0 },
      price_cost: { accepted: 0, rejected: 0 },
      gender: { accepted: 0, rejected: 0 },
      detail_product_group: { accepted: 0, rejected: 0 },
      size: { accepted: 0, rejected: 0 },
      age_group: { accepted: 0, rejected: 0 },
      activity_group: { accepted: 0, rejected: 0 },
      lifestyle_group: { accepted: 0, rejected: 0 },
    };

    for (const row of rows) {
      const result = this.transformProductData(row);

      result.acceptedFields.forEach((f) => fieldStats[f].accepted++);
      result.rejectedFields.forEach((f) => fieldStats[f].rejected++);

      const acceptedCount = result.acceptedFields.length;

      if (acceptedCount === 10) {
        const exists = await this.checkProductExists(result.data.product_id);
        if (exists) {
          skipped++;
          this.logger.warn(
            `Skip product row: Sản phẩm với ID '${result.data.product_id}' đã tồn tại trong database!`,
          );
        } else {
          validProducts.push(result.data);
        }
      } else {
        skipped++;
        const errors = Object.values(result.errorDetails ?? {}).join(', ');
        this.logger.warn(`Skip product row (ID: '${row['product_id']}'): ${errors}`);
      }
    }

    let inserted = 0;
    for (const prod of validProducts) {
      try {
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
            prod.product_id,
            prod.color,
            prod.listing_price,
            prod.price_cost,
            prod.gender,
            prod.detail_product_group,
            prod.size,
            prod.age_group,
            prod.activity_group,
            prod.lifestyle_group,
          ],
        );
        inserted++;
      } catch (err) {
        this.logger.warn(
          `Lỗi khi đẩy sản phẩm ${prod.product_id} vào DB: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Kết quả import: Tổng số ${rows.length} dòng. ` +
      `Dữ liệu sạch (100% hợp lệ): ${validProducts.length} dòng (Đã đẩy thành công: ${inserted}). ` +
      `Bị loại bỏ do vi phạm định dạng hoặc bị null: ${skipped} dòng.`,
    );

    return {
      total: rows.length,
      inserted,
      skipped,
      fieldStats,
    };
  }

  // ───────────────────────────
  //  SaleReport Import
  // ───────────────────────────
  async importSaleReports(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty('saleReport'))) {
      this.logger.log('saleReport table already has data, skipping import');
      return { total: 0, inserted: 0, skipped: 0 };
    }

    return this.importSaleReportsFast(filePaths, bypassEmptyCheck);
  }

  //  InventoryReport Import
  // ───────────────────────────
  async importInventoryReports(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty('InventoryReport'))) {
      this.logger.log('InventoryReport table already has data, skipping import');
      return { total: 0, inserted: 0, skipped: 0 };
    }

    return this.importInventoryReportsFast(filePaths, bypassEmptyCheck);
  }

  //  Import all
  // ───────────────────────────
  private async importSaleReportsFast(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty('saleReport'))) {
      this.logger.log('saleReport table already has data, skipping import');
      return { total: 0, inserted: 0, skipped: 0 };
    }

    const existingProductIds = await this.loadExistingProductIds();
    let total = 0;
    let inserted = 0;
    let skipped = 0;
    const validSaleRows: CleanedSaleReport[] = [];
    const branchIds = new Set<string>();

    const collectRows = async (rows: Record<string, any>[], sourceLabel?: string) => {
      for (const row of rows) {
        try {
          const cleaned = this.transformSaleReportData(row);
          if (!cleaned) {
            throw new Error('Dữ liệu không hợp lệ (trống hoặc chứa giá trị null, n/a, undefined)');
          }

          if (!existingProductIds.has(cleaned.product_id)) {
            throw new Error(
              `Sản phẩm với ID '${cleaned.product_id}' không tồn tại trong cơ sở dữ liệu!`,
            );
          }

          validSaleRows.push(cleaned);
          branchIds.add(cleaned.branch_id);
        } catch (err) {
          skipped++;
          const prefix = sourceLabel ? ` in ${sourceLabel}` : '';
          this.logger.warn(
            `Skip sale row${prefix} (Product ID: '${row['product_id']}'): ${(err as Error).message}`,
          );
        }
      }
    };

    if (Buffer.isBuffer(filePaths)) {
      const rows = await readExcel(filePaths);
      total = rows.length;
      await collectRows(rows);
    } else {
      const dir = path.join(this.dataDir, 'sales');
      const files = filePaths ?? listExcelFiles(dir);
      for (const file of files) {
        const fp = path.join(dir, file);
        const rows = await readExcel(fp);
        total += rows.length;
        await collectRows(rows, file);
        this.logger.log(`Validated ${rows.length} rows from ${file}`);
      }
    }

    await this.bulkInsertIgnore(
      'storeBranch',
      ['store_id', 'name'],
      Array.from(branchIds).map((branchId) => [branchId, branchId]),
    );

    for (const batch of this.chunk(validSaleRows, this.batchSize)) {
      const values = batch.flatMap((cleaned) => [
        cleaned.sale_id,
        cleaned.product_id,
        cleaned.sold_quantity,
        cleaned.distribution_channel,
        cleaned.branch_id,
        cleaned.time_report,
      ]);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
      await this.db.client.query<ResultSetHeader>(
        `INSERT INTO saleReport (sale_id, product_id, sold_quantity, distribution_channel, branch_id, time_report)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           sold_quantity = VALUES(sold_quantity),
           distribution_channel = VALUES(distribution_channel)`,
        values,
      );
      inserted += batch.length;
    }

    this.logger.log(
      `Imported successfully ${inserted}/${total} sale records. Skipped (failed): ${skipped} records.`,
    );
    return { total, inserted, skipped };
  }

  private async importInventoryReportsFast(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty('InventoryReport'))) {
      this.logger.log('InventoryReport table already has data, skipping import');
      return { total: 0, inserted: 0, skipped: 0 };
    }

    const existingProductIds = await this.loadExistingProductIds();
    let total = 0;
    let inserted = 0;
    let skipped = 0;
    const validInventoryRows: CleanedInventoryReport[] = [];
    const plantIds = new Set<string>();

    const collectRows = async (rows: Record<string, any>[], sourceLabel?: string) => {
      for (const row of rows) {
        try {
          const cleaned = this.transformInventoryReportData(row);
          if (!cleaned) {
            throw new Error('Dữ liệu không hợp lệ (trống hoặc chứa giá trị null, n/a, undefined)');
          }

          if (!existingProductIds.has(cleaned.product_id)) {
            throw new Error(
              `Sản phẩm với ID '${cleaned.product_id}' không tồn tại trong cơ sở dữ liệu!`,
            );
          }

          validInventoryRows.push(cleaned);
          plantIds.add(cleaned.plant_id);
        } catch (err) {
          skipped++;
          const prefix = sourceLabel ? ` in ${sourceLabel}` : '';
          this.logger.warn(
            `Skip inventory row${prefix} (Product ID: '${row['product_id']}'): ${(err as Error).message}`,
          );
        }
      }
    };

    if (Buffer.isBuffer(filePaths)) {
      const rows = await readExcel(filePaths);
      total = rows.length;
      await collectRows(rows);
    } else {
      const dir = path.join(this.dataDir, 'inventorys');
      const files = filePaths ?? listExcelFiles(dir);
      for (const file of files) {
        const fp = path.join(dir, file);
        const rows = await readExcel(fp);
        total += rows.length;
        await collectRows(rows, file);
        this.logger.log(`Validated ${rows.length} rows from ${file}`);
      }
    }

    await this.bulkInsertIgnore(
      'Plant',
      ['plant_id', 'name_plant'],
      Array.from(plantIds).map((plantId) => [plantId, plantId]),
    );

    for (const batch of this.chunk(validInventoryRows, this.batchSize)) {
      const values = batch.flatMap((cleaned) => [
        cleaned.inventory_id,
        cleaned.product_id,
        cleaned.plant_id,
        cleaned.calendar_year_week,
        cleaned.quantity,
      ]);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(', ');
      await this.db.client.query<ResultSetHeader>(
        `INSERT INTO InventoryReport (inventory_id, product_id, plant_id, calendar_year_week, quantity)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           quantity = VALUES(quantity)`,
        values,
      );
      inserted += batch.length;
    }

    this.logger.log(
      `Imported successfully ${inserted}/${total} inventory records. Skipped (failed): ${skipped} records.`,
    );
    return { total, inserted, skipped };
  }

  async importAll(): Promise<{
    product: { total: number; inserted: number; skipped: number };
    sale: { total: number; inserted: number; skipped: number };
    inventory: { total: number; inserted: number; skipped: number };
  }> {
    // 1. Bắt buộc chạy tuần tự Sản phẩm trước tiên để đảm bảo khóa ngoại (Foreign Keys) đã tồn tại trong DB
    const product = await this.importProducts();

    // 2. Chạy song song Báo cáo bán hàng và Báo cáo tồn kho vì chúng độc lập với nhau
    const [sale, inventory] = await Promise.all([
      this.importSaleReports(),
      this.importInventoryReports(),
    ]);

    return { product, sale, inventory };
  }

  // ───────────────────────────
  //  Helpers
  // ───────────────────────────

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

  private async checkProductExists(productId: string): Promise<boolean> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT 1 FROM product WHERE product_id = ? LIMIT 1`,
      [productId],
    );
    return rows.length > 0;
  }
}
