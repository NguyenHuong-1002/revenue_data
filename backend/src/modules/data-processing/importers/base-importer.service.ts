import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as path from 'node:path';

export abstract class BaseImporterService {
  protected readonly logger: Logger;
  protected readonly dataDir = path.resolve(__dirname, '../../../../data');
  protected readonly batchSize = 500;

  constructor(loggerName: string) {
    this.logger = new Logger(loggerName);
  }

  protected async isTableEmpty(repo: Repository<any>): Promise<boolean> {
    const count = await repo.createQueryBuilder().getCount();
    return count === 0;
  }

  protected chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  }

  protected async loadExistingProductIds(
    productRepo: Repository<any>,
  ): Promise<Set<string>> {
    const rows = await productRepo.find({ select: ['product_id'] });
    return new Set(rows.map((row: any) => String(row.product_id)));
  }

  protected async checkProductExists(
    productRepo: Repository<any>,
    productId: string,
  ): Promise<boolean> {
    const found = await productRepo.findOne({ where: { product_id: productId } });
    return found !== null;
  }
}
