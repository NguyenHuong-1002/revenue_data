import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/models/database.service';
import { CreateBranchDto } from './DTO/create-branch.dto';
import { GetBranchAllDto } from './DTO/get-branch-all.dto';
import { UpdateBranchDto } from './DTO/update-branch.dto';
import { IBranch, IPaginatedBranches } from './interfaces/branch.interface';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class BranchService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAll(filters: GetBranchAllDto): Promise<IPaginatedBranches> {
    const whereClauses: string[] = [];
    const values: unknown[] = [];

    if (filters.city) {
      whereClauses.push('city LIKE ?');
      values.push(`%${filters.city}%`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const [countRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM storeBranch ${whereSQL}`,
      values,
    );
    const total = Number(countRows[0].total);

    const { page, limit } = filters;
    const offset = (page - 1) * limit;
    const [dataRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT * FROM storeBranch ${whereSQL} ORDER BY store_id ASC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return {
      data: dataRows as IBranch[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string): Promise<IBranch> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT * FROM storeBranch WHERE store_id = ?',
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Chi nhánh với mã '${id}' không tồn tại`);
    }
    return rows[0] as IBranch;
  }

  async create(dto: CreateBranchDto, adminUsername?: string): Promise<IBranch> {
    await this.db.client.query<ResultSetHeader>(
      'INSERT INTO storeBranch (store_id, name, city) VALUES (?, ?, ?)',
      [dto.store_id, dto.name, dto.city],
    );

    await this.notificationService.createNotification({
      title: 'Tạo chi nhánh mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã tạo chi nhánh ${dto.store_id} - ${dto.name}.`,
      type: 'SYSTEM',
    });

    return this.getById(dto.store_id);
  }

  async update(id: string, dto: UpdateBranchDto, adminUsername?: string): Promise<IBranch> {
    await this.getById(id);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (dto.name !== undefined) {
      fields.push('name = ?');
      values.push(dto.name);
    }
    if (dto.city !== undefined) {
      fields.push('city = ?');
      values.push(dto.city);
    }

    if (fields.length > 0) {
      values.push(id);
      await this.db.client.query<ResultSetHeader>(
        `UPDATE storeBranch SET ${fields.join(', ')} WHERE store_id = ?`,
        values,
      );
    }

    await this.notificationService.createNotification({
      title: 'Cập nhật chi nhánh',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật chi nhánh ${id}.`,
      type: 'SYSTEM',
    });

    return this.getById(id);
  }

  async delete(id: string, adminUsername?: string): Promise<boolean> {
    await this.getById(id);

    const [result] = await this.db.client.query<ResultSetHeader>(
      'DELETE FROM storeBranch WHERE store_id = ?',
      [id],
    );
    const success = result.affectedRows > 0;

    if (success) {
      await this.notificationService.createNotification({
        title: 'Xóa chi nhánh',
        content: `Admin ${adminUsername || 'hệ thống'} đã xóa chi nhánh ${id} khỏi hệ thống.`,
        type: 'SYSTEM',
      });
    }

    return success;
  }
}
