import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/models/database.service';
import { CreateProductDto } from './DTO/create-product.dto';
import { GetProductAllDto } from './DTO/get-product-all.dto';
import { IProduct, IPaginatedProducts } from './interfaces/product.interface';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async getProductsAll(filters: GetProductAllDto): Promise<IPaginatedProducts> {
    const whereClauses: string[] = [];
    const values: unknown[] = [];

    if (filters.product_id) {
      whereClauses.push('product_id = ?');
      values.push(filters.product_id);
    }
    if (filters.color) {
      whereClauses.push('color LIKE ?');
      values.push(`%${filters.color}%`);
    }
    if (filters.listing_price !== undefined) {
      whereClauses.push('listing_price = ?');
      values.push(filters.listing_price);
    }
    if (filters.price_cost !== undefined) {
      whereClauses.push('price_cost = ?');
      values.push(filters.price_cost);
    }
    if (filters.gender) {
      whereClauses.push('gender = ?');
      values.push(filters.gender);
    }
    if (filters.detail_product_group) {
      whereClauses.push('detail_product_group = ?');
      values.push(filters.detail_product_group);
    }
    if (filters.size !== undefined) {
      whereClauses.push('size = ?');
      values.push(filters.size);
    }
    if (filters.age_group !== undefined) {
      whereClauses.push('age_group = ?');
      values.push(filters.age_group);
    }
    if (filters.activity_group) {
      whereClauses.push('activity_group = ?');
      values.push(filters.activity_group);
    }
    if (filters.lifestyle_group) {
      whereClauses.push('lifestyle_group = ?');
      values.push(filters.lifestyle_group);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countSQL = `SELECT COUNT(*) as total FROM product ${whereSQL}`;
    const [countRows] = await this.db.client.query<RowDataPacket[]>(countSQL, values);
    const total = Number(countRows[0].total);

    const { page, limit } = filters;
    const offset = (page - 1) * limit;
    const dataSQL = `SELECT * FROM product ${whereSQL} ORDER BY product_id ASC LIMIT ? OFFSET ?`;
    const [dataRows] = await this.db.client.query<RowDataPacket[]>(dataSQL, [
      ...values,
      limit,
      offset,
    ]);

    return {
      data: dataRows as IProduct[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDetailProduct(id: string): Promise<IProduct> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT * FROM product WHERE product_id = ?',
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return rows[0] as IProduct;
  }

  async createProduct(dto: CreateProductDto, adminUsername?: string): Promise<IProduct> {
    const id = `SP${Date.now()}`;
    await this.db.client.query<ResultSetHeader>(
      `INSERT INTO product (product_id, color, listing_price, price_cost, gender, detail_product_group, size, age_group, activity_group, lifestyle_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.color,
        dto.listing_price,
        dto.price_cost,
        dto.gender,
        dto.detail_product_group,
        dto.size,
        dto.age_group,
        dto.activity_group,
        dto.lifestyle_group,
      ],
    );

    // Tự động tạo thông báo
    await this.notificationService.createNotification({
      title: 'Tạo sản phẩm mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã tạo mới sản phẩm ${id} (Màu: ${dto.color}, Kích cỡ: ${dto.size}).`,
      type: 'SYSTEM',
    });

    return this.getDetailProduct(id);
  }

  async updateProduct(
    dto: CreateProductDto,
    id: string,
    adminUsername?: string,
  ): Promise<IProduct> {
    await this.getDetailProduct(id);
    await this.db.client.query<ResultSetHeader>(
      `UPDATE product SET color = ?, listing_price = ?, price_cost = ?, gender = ?, detail_product_group = ?, size = ?, age_group = ?, activity_group = ?, lifestyle_group = ? WHERE product_id = ?`,
      [
        dto.color,
        dto.listing_price,
        dto.price_cost,
        dto.gender,
        dto.detail_product_group,
        dto.size,
        dto.age_group,
        dto.activity_group,
        dto.lifestyle_group,
        id,
      ],
    );

    // Tự động tạo thông báo
    await this.notificationService.createNotification({
      title: 'Cập nhật sản phẩm',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật thông tin sản phẩm ${id}.`,
      type: 'SYSTEM',
    });

    return this.getDetailProduct(id);
  }

  async deleteProduct(id: string, adminUsername?: string): Promise<boolean> {
    await this.getDetailProduct(id);
    const [result] = await this.db.client.query<ResultSetHeader>(
      'DELETE FROM product WHERE product_id = ?',
      [id],
    );
    const success = result.affectedRows > 0;

    if (success) {
      // Tự động tạo thông báo
      await this.notificationService.createNotification({
        title: 'Xóa sản phẩm',
        content: `Admin ${adminUsername || 'hệ thống'} đã xóa sản phẩm ${id} khỏi hệ thống.`,
        type: 'SYSTEM',
      });
    }

    return success;
  }
}
