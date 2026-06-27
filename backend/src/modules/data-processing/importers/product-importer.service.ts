import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'node:path';
import { ProductEntity } from '../../products/entities/product.entity';
import { BaseImporterService } from './base-importer.service';
import {
  CleanedProduct,
  TransformResult,
  ImportResult,
  FieldStats,
} from '../interfaces/data.interface';
import {
  safeString,
  safeNumber,
  isValidProductString as isValidProduct,
} from '../utils/validation.util';
import {
  normalizeGender,
  normalizeAgeGroup,
  normalizeActivityGroup,
} from '../utils/validation.util';
import { readExcel } from '../utils/excel-reader.util';

const s = safeString;
const n = safeNumber;

@Injectable()
export class ProductImporterService extends BaseImporterService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {
    super('ProductImporter');
  }

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

    return { data, acceptedFields, rejectedFields, errorDetails };
  }

  async importProducts(
    filePath?: string | Buffer,
    bypassEmptyCheck = false,
  ): Promise<ImportResult> {
    if (!bypassEmptyCheck && !(await this.isTableEmpty(this.productRepo))) {
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

      if (result.acceptedFields.length === 10) {
        const exists = await this.checkProductExists(this.productRepo, result.data.product_id);
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
        const entity = this.productRepo.create(prod as unknown as ProductEntity);
        await this.productRepo.save(entity);
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

    return { total: rows.length, inserted, skipped, fieldStats };
  }
}
