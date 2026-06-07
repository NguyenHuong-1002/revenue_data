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

  /* ═══════════════════════════════════════
     INVENTORY STATS — KPIs tổng quan
  ═══════════════════════════════════════ */
  async getInventoryKpis(): Promise<{
    totalStock: number;
    totalRecords: number;
    totalPlants: number;
    totalProducts: number;
    currentMonthStock: number;
    previousMonthStock: number;
    growthPercent: number | null;
    topPlant: { plant_id: string; total: number } | null;
    topProduct: { product_id: string; total: number } | null;
    avgStockPerPlant: number;
  }> {
    const [[totalsRow]] = await this.db.client.query<RowDataPacket[]>(
      `SELECT
         SUM(quantity) AS totalStock,
         COUNT(*) AS totalRecords,
         COUNT(DISTINCT plant_id) AS totalPlants,
         COUNT(DISTINCT product_id) AS totalProducts
       FROM InventoryReport`,
    );

    const [[curRow]] = await this.db.client.query<RowDataPacket[]>(
      `SELECT SUM(quantity) AS stock
       FROM InventoryReport
       WHERE DATE_FORMAT(calendar_year_week,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')`,
    );
    const [[prevRow]] = await this.db.client.query<RowDataPacket[]>(
      `SELECT SUM(quantity) AS stock
       FROM InventoryReport
       WHERE DATE_FORMAT(calendar_year_week,'%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m')`,
    );

    const [[topPlantRow]] = await this.db.client.query<RowDataPacket[]>(
      `SELECT plant_id, SUM(quantity) AS total
       FROM InventoryReport GROUP BY plant_id ORDER BY total DESC LIMIT 1`,
    );
    const [[topProductRow]] = await this.db.client.query<RowDataPacket[]>(
      `SELECT product_id, SUM(quantity) AS total
       FROM InventoryReport GROUP BY product_id ORDER BY total DESC LIMIT 1`,
    );

    const totalStock = Number(totalsRow?.totalStock ?? 0);
    const totalPlants = Number(totalsRow?.totalPlants ?? 0);
    const curStock = Number(curRow?.stock ?? 0);
    const prevStock = Number(prevRow?.stock ?? 0);
    const growthPercent =
      prevStock > 0 ? Number((((curStock - prevStock) / prevStock) * 100).toFixed(2)) : null;

    return {
      totalStock,
      totalRecords: Number(totalsRow?.totalRecords ?? 0),
      totalPlants,
      totalProducts: Number(totalsRow?.totalProducts ?? 0),
      currentMonthStock: curStock,
      previousMonthStock: prevStock,
      growthPercent,
      topPlant: topPlantRow ? { plant_id: String(topPlantRow.plant_id), total: Number(topPlantRow.total) } : null,
      topProduct: topProductRow ? { product_id: String(topProductRow.product_id), total: Number(topProductRow.total) } : null,
      avgStockPerPlant: totalPlants > 0 ? Math.round(totalStock / totalPlants) : 0,
    };
  }

  /* ═══════════════════════════════════════
     INVENTORY STATS — Xếp hạng sản phẩm
  ═══════════════════════════════════════ */
  async getInventoryRankings(topN = 10): Promise<{
    topStocked: { product_id: string; total: number }[];
    bottomStocked: { product_id: string; total: number }[];
    topPlants: { plant_id: string; total: number; record_count: number }[];
    monthlyTrend: { month: string; total: number; growthPct: number | null }[];
  }> {
    const [topRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT product_id, SUM(quantity) AS total
       FROM InventoryReport GROUP BY product_id ORDER BY total DESC LIMIT ?`,
      [topN],
    );
    const [bottomRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT product_id, SUM(quantity) AS total
       FROM InventoryReport GROUP BY product_id ORDER BY total ASC LIMIT ?`,
      [topN],
    );
    const [plantRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT plant_id, SUM(quantity) AS total, COUNT(*) AS record_count
       FROM InventoryReport GROUP BY plant_id ORDER BY total DESC LIMIT ?`,
      [topN],
    );
    const [monthlyRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT DATE_FORMAT(calendar_year_week,'%Y-%m') AS month, SUM(quantity) AS total
       FROM InventoryReport
       GROUP BY DATE_FORMAT(calendar_year_week,'%Y-%m')
       ORDER BY month ASC`,
    );

    const monthlyWithGrowth = (monthlyRows as RowDataPacket[]).map((row, i) => {
      const prev = i > 0 ? Number((monthlyRows as RowDataPacket[])[i - 1].total ?? 0) : 0;
      const cur = Number(row.total ?? 0);
      const growthPct = prev > 0 ? Number((((cur - prev) / prev) * 100).toFixed(2)) : null;
      return { month: String(row.month), total: cur, growthPct };
    });

    return {
      topStocked: topRows.map(r => ({ product_id: String(r.product_id), total: Number(r.total) })),
      bottomStocked: bottomRows.map(r => ({ product_id: String(r.product_id), total: Number(r.total) })),
      topPlants: plantRows.map(r => ({ plant_id: String(r.plant_id), total: Number(r.total), record_count: Number(r.record_count) })),
      monthlyTrend: monthlyWithGrowth,
    };
  }

  /* ═══════════════════════════════════════
     INVENTORY STATS — Cảnh báo tồn kho
  ═══════════════════════════════════════ */
  async getInventoryAlerts(lowThreshold = 50, highThreshold = 10000): Promise<{
    lowStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
    highStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
    totalAlerts: number;
  }> {
    const [lowRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT product_id, plant_id, quantity, DATE_FORMAT(calendar_year_week,'%Y-%m-%d') AS last_date
       FROM InventoryReport
       WHERE quantity <= ? AND quantity > 0
       ORDER BY quantity ASC LIMIT 20`,
      [lowThreshold],
    );
    const [highRows] = await this.db.client.query<RowDataPacket[]>(
      `SELECT product_id, plant_id, quantity, DATE_FORMAT(calendar_year_week,'%Y-%m-%d') AS last_date
       FROM InventoryReport
       WHERE quantity >= ?
       ORDER BY quantity DESC LIMIT 20`,
      [highThreshold],
    );

    return {
      lowStock: lowRows.map(r => ({ product_id: String(r.product_id), plant_id: String(r.plant_id), quantity: Number(r.quantity), last_date: String(r.last_date) })),
      highStock: highRows.map(r => ({ product_id: String(r.product_id), plant_id: String(r.plant_id), quantity: Number(r.quantity), last_date: String(r.last_date) })),
      totalAlerts: lowRows.length + highRows.length,
    };
  }
}
