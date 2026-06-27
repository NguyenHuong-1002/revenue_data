import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { SaleReportEntity } from '../../sale-reports/entities/sale-report.entity';
import { StoreBranchEntity } from '../../branches/entities/branch.entity';
import { ProductEntity } from '../../products/entities/product.entity';
import { BaseImporterService } from './base-importer.service';
import { CleanedSaleReport } from '../interfaces/data.interface';
import {
  safeString,
  safeNumber,
  isValidProductString as isValidProduct,
  parseMonthToDateStr,
  normalizeDistributionChannel,
} from '../utils/validation.util';
import { readExcel, listExcelFiles } from '../utils/excel-reader.util';

const s = safeString;
const n = safeNumber;

@Injectable()
export class SaleImporterService extends BaseImporterService {
  constructor(
    @InjectRepository(SaleReportEntity)
    private readonly saleRepo: Repository<SaleReportEntity>,
    @InjectRepository(StoreBranchEntity)
    private readonly branchRepo: Repository<StoreBranchEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {
    super('SaleImporter');
  }

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

    return { sale_id: uuidv4(), product_id, sold_quantity: sold_quantity as number, distribution_channel, branch_id, time_report };
  }

  async importSaleReports(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty(this.saleRepo))) {
      this.logger.log('saleReport table already has data, skipping import');
      return { total: 0, inserted: 0, skipped: 0 };
    }

    const existingProductIds = await this.loadExistingProductIds(this.productRepo);
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

    for (const branchId of branchIds) {
      const existing = await this.branchRepo.findOne({ where: { store_id: branchId } });
      if (!existing) {
        const branch = this.branchRepo.create({ store_id: branchId, name: branchId });
        await this.branchRepo.save(branch);
      }
    }

    for (const batch of this.chunk(validSaleRows, this.batchSize)) {
      const entities: SaleReportEntity[] = batch.map((cleaned) =>
        this.saleRepo.create(cleaned as unknown as SaleReportEntity),
      );
      await this.saleRepo.save(entities);
      inserted += batch.length;
    }

    this.logger.log(
      `Imported successfully ${inserted}/${total} sale records. Skipped (failed): ${skipped} records.`,
    );
    return { total, inserted, skipped };
  }
}
