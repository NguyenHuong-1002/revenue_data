import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/models/database.service';
import { CreatePlantDto } from './DTO/create-plant.dto';
import { GetPlantAllDto } from './DTO/get-plant-all.dto';
import { UpdatePlantDto } from './DTO/update-plant.dto';
import { IPlant, IPaginatedPlants } from './interfaces/plant.interface';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class PlantService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async getAll(filters: GetPlantAllDto): Promise<IPaginatedPlants> {
    const whereClauses: string[] = [];
    const values: unknown[] = [];

    if (filters.address) {
      whereClauses.push('address LIKE ?');
      values.push(`%${filters.address}%`);
    }
    if (filters.manager_name) {
      whereClauses.push('manager_name LIKE ?');
      values.push(`%${filters.manager_name}%`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const [countRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM Plant ${whereSQL}`,
      values,
    );
    const total = Number(countRows[0].total);

    const { page, limit } = filters;
    const offset = (page - 1) * limit;
    const [dataRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT * FROM Plant ${whereSQL} ORDER BY plant_id ASC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return {
      data: dataRows as IPlant[],
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string): Promise<IPlant> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT * FROM Plant WHERE plant_id = ?',
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Nhà máy với mã '${id}' không tồn tại`);
    }
    return rows[0] as IPlant;
  }

  async create(dto: CreatePlantDto, adminUsername?: string): Promise<IPlant> {
    await this.db.client.query<ResultSetHeader>(
      'INSERT INTO Plant (plant_id, name_plant, address, manager_name, phone) VALUES (?, ?, ?, ?, ?)',
      [dto.plant_id, dto.name_plant, dto.address, dto.manager_name, dto.phone],
    );

    await this.notificationService.createNotification({
      title: 'Tạo nhà máy mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã tạo nhà máy ${dto.plant_id} - ${dto.name_plant}.`,
      type: 'SYSTEM',
    });

    return this.getById(dto.plant_id);
  }

  async update(id: string, dto: UpdatePlantDto, adminUsername?: string): Promise<IPlant> {
    await this.getById(id);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (dto.name_plant !== undefined) {
      fields.push('name_plant = ?');
      values.push(dto.name_plant);
    }
    if (dto.address !== undefined) {
      fields.push('address = ?');
      values.push(dto.address);
    }
    if (dto.manager_name !== undefined) {
      fields.push('manager_name = ?');
      values.push(dto.manager_name);
    }
    if (dto.phone !== undefined) {
      fields.push('phone = ?');
      values.push(dto.phone);
    }

    if (fields.length > 0) {
      values.push(id);
      await this.db.client.query<ResultSetHeader>(
        `UPDATE Plant SET ${fields.join(', ')} WHERE plant_id = ?`,
        values,
      );
    }

    await this.notificationService.createNotification({
      title: 'Cập nhật nhà máy',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật nhà máy ${id}.`,
      type: 'SYSTEM',
    });

    return this.getById(id);
  }

  async delete(id: string, adminUsername?: string): Promise<boolean> {
    await this.getById(id);

    const [result] = await this.db.client.query<ResultSetHeader>(
      'DELETE FROM Plant WHERE plant_id = ?',
      [id],
    );
    const success = result.affectedRows > 0;

    if (success) {
      await this.notificationService.createNotification({
        title: 'Xóa nhà máy',
        content: `Admin ${adminUsername || 'hệ thống'} đã xóa nhà máy ${id} khỏi hệ thống.`,
        type: 'SYSTEM',
      });
    }

    return success;
  }
}
