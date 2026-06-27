import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { InventoryReportEntity } from '../../inventory-reports/entities/inventory-report.entity';
import { PlantEntity } from '../../plants/entities/plant.entity';
import { ProductEntity } from '../../products/entities/product.entity';
import { BaseImporterService } from './base-importer.service';
import { CleanedInventoryReport } from '../interfaces/data.interface';
import {
  safeString,
  safeNumber,
  isValidProductString as isValidProduct,
  parseDate,
} from '../utils/validation.util';
import { readExcel, listExcelFiles } from '../utils/excel-reader.util';

const s = safeString;
const n = safeNumber;

@Injectable()
export class InventoryImporterService extends BaseImporterService {
  constructor(
    @InjectRepository(InventoryReportEntity)
    private readonly inventoryRepo: Repository<InventoryReportEntity>,
    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {
    super('InventoryImporter');
  }

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

    return { inventory_id: uuidv4(), product_id, plant_id, calendar_year_week, quantity };
  }

  async importInventoryReports(
    filePaths?: string[] | Buffer,
    bypassEmptyCheck = false,
  ): Promise<{ total: number; inserted: number; skipped: number }> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty(this.inventoryRepo))) {
      this.logger.log('InventoryReport table already has data, skipping import');
      return { total: 0, inserted: 0, skipped: 0 };
    }

    const existingProductIds = await this.loadExistingProductIds(this.productRepo);
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

    for (const plantId of plantIds) {
      const existing = await this.plantRepo.findOne({ where: { plant_id: plantId } });
      if (!existing) {
        const plant = this.plantRepo.create({ plant_id: plantId, name_plant: plantId });
        await this.plantRepo.save(plant);
      }
    }

    for (const batch of this.chunk(validInventoryRows, this.batchSize)) {
      const entities: InventoryReportEntity[] = batch.map((cleaned) =>
        this.inventoryRepo.create(cleaned as unknown as InventoryReportEntity),
      );
      await this.inventoryRepo.save(entities);
      inserted += batch.length;
    }

    this.logger.log(
      `Imported successfully ${inserted}/${total} inventory records. Skipped (failed): ${skipped} records.`,
    );
    return { total, inserted, skipped };
  }
}
