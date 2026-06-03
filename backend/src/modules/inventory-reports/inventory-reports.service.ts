import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/models/database.service';
import { CreateInventoryReportDto } from './DTO/create-inventory-report.dto';
import { GetInventoryReportAllDto } from './DTO/get-inventory-report-all.dto';
import { IInventoryReport, IPaginatedInventoryReports } from './interfaces/inventory-report.interface';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class InventoryReportsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async getInventoryReportsAll(filters: GetInventoryReportAllDto): Promise<IPaginatedInventoryReports> {
    const whereClauses: string[] = [];
    const values: unknown[] = [];

    if (filters.product_id) {
      whereClauses.push('product_id = ?');
      values.push(filters.product_id.trim());
    }
    if (filters.plant_id) {
      whereClauses.push('plant_id = ?');
      values.push(filters.plant_id.trim());
    }
    if (filters.fromMonth) {
      whereClauses.push('calendar_year_week >= ?');
      values.push(`${filters.fromMonth}-01 00:00:00`);
    }
    if (filters.toMonth) {
      const [year, month] = filters.toMonth.split('-').map(Number);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      whereClauses.push('calendar_year_week <= ?');
      values.push(`${filters.toMonth}-${String(lastDay).padStart(2, '0')} 23:59:59`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countSQL = `SELECT COUNT(*) as total FROM InventoryReport ${whereSQL}`;
    const [countRows] = await this.db.client.query<RowDataPacket[]>(countSQL, values);
    const total = Number(countRows[0].total);

    const { skip, limit } = filters;
    const dataSQL = `SELECT * FROM InventoryReport ${whereSQL} ORDER BY calendar_year_week DESC, inventory_id DESC LIMIT ? OFFSET ?`;
    const [dataRows] = await this.db.client.query<RowDataPacket[]>(dataSQL, [
      ...values,
      limit,
      skip,
    ]);

    return {
      data: dataRows as IInventoryReport[],
      meta: {
        skip,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDetailInventoryReport(id: string): Promise<IInventoryReport> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT * FROM InventoryReport WHERE inventory_id = ?',
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Inventory report with ID '${id}' not found`);
    }
    return rows[0] as IInventoryReport;
  }

  async createInventoryReport(dto: CreateInventoryReportDto, adminUsername?: string): Promise<IInventoryReport> {
    const id = `INV${Date.now()}`;
    await this.db.client.query<ResultSetHeader>(
      `INSERT INTO InventoryReport (inventory_id, product_id, plant_id, calendar_year_week, quantity) VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        dto.product_id,
        dto.plant_id,
        dto.calendar_year_week,
        dto.quantity,
      ],
    );

    await this.notificationService.createNotification({
      title: 'Tạo báo cáo tồn kho mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã thêm mới báo cáo tồn kho ${id} cho sản phẩm ${dto.product_id} (Số lượng: ${dto.quantity}).`,
      type: 'SYSTEM',
    });

    return this.getDetailInventoryReport(id);
  }

  async updateInventoryReport(
    dto: CreateInventoryReportDto,
    id: string,
    adminUsername?: string,
  ): Promise<IInventoryReport> {
    await this.getDetailInventoryReport(id);
    await this.db.client.query<ResultSetHeader>(
      `UPDATE InventoryReport SET product_id = ?, plant_id = ?, calendar_year_week = ?, quantity = ? WHERE inventory_id = ?`,
      [
        dto.product_id,
        dto.plant_id,
        dto.calendar_year_week,
        dto.quantity,
        id,
      ],
    );

    await this.notificationService.createNotification({
      title: 'Cập nhật báo cáo tồn kho',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật thông tin báo cáo tồn kho ${id}.`,
      type: 'SYSTEM',
    });

    return this.getDetailInventoryReport(id);
  }

  async deleteInventoryReport(id: string, adminUsername?: string): Promise<boolean> {
    await this.getDetailInventoryReport(id);
    const [result] = await this.db.client.query<ResultSetHeader>(
      'DELETE FROM InventoryReport WHERE inventory_id = ?',
      [id],
    );
    const success = result.affectedRows > 0;

    if (success) {
      await this.notificationService.createNotification({
        title: 'Xóa báo cáo tồn kho',
        content: `Admin ${adminUsername || 'hệ thống'} đã xóa báo cáo tồn kho ${id}.`,
        type: 'SYSTEM',
      });
    }

    return success;
  }

  async getInventoryReportStats(): Promise<{
    plant_inventory: { name: string; count: number }[];
    monthly_inventory: { name: string; count: number }[];
  }> {
    const [plantRows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT plant_id as name, SUM(quantity) as count FROM InventoryReport GROUP BY plant_id ORDER BY count DESC LIMIT 5',
    );
    const [monthlyRows] = await this.db.client.query<RowDataPacket[]>(
      "SELECT DATE_FORMAT(calendar_year_week, '%Y-%m') as name, SUM(quantity) as count FROM InventoryReport GROUP BY DATE_FORMAT(calendar_year_week, '%Y-%m') ORDER BY name DESC LIMIT 6",
    );

    return {
      plant_inventory: plantRows.map(r => ({ name: String(r.name), count: Number(r.count ?? 0) })),
      monthly_inventory: monthlyRows.reverse().map(r => ({ name: String(r.name), count: Number(r.count ?? 0) })),
    };
  }
}
