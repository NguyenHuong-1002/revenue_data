import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/models/database.service';
import { CreateSaleReportDto } from './DTO/create-sale-report.dto';
import { GetSaleReportAllDto } from './DTO/get-sale-report-all.dto';
import { ISaleReport, IPaginatedSaleReports } from './interfaces/sale-report.interface';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class SaleReportsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async getSaleReportsAll(filters: GetSaleReportAllDto): Promise<IPaginatedSaleReports> {
    const whereClauses: string[] = [];
    const values: unknown[] = [];

    if (filters.product_id) {
      whereClauses.push('product_id = ?');
      values.push(filters.product_id.trim());
    }
    if (filters.branch_id) {
      whereClauses.push('branch_id = ?');
      values.push(filters.branch_id.trim());
    }
    if (filters.distribution_channel) {
      whereClauses.push('distribution_channel = ?');
      values.push(filters.distribution_channel.trim());
    }
    if (filters.fromMonth) {
      whereClauses.push('time_report >= ?');
      values.push(`${filters.fromMonth}-01 00:00:00`);
    }
    if (filters.toMonth) {
      // End of the target month
      const [year, month] = filters.toMonth.split('-').map(Number);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      whereClauses.push('time_report <= ?');
      values.push(`${filters.toMonth}-${String(lastDay).padStart(2, '0')} 23:59:59`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countSQL = `SELECT COUNT(*) as total FROM saleReport ${whereSQL}`;
    const [countRows] = await this.db.client.query<RowDataPacket[]>(countSQL, values);
    const total = Number(countRows[0].total);

    const { skip, limit } = filters;
    const dataSQL = `SELECT * FROM saleReport ${whereSQL} ORDER BY time_report DESC, sale_id DESC LIMIT ? OFFSET ?`;
    const [dataRows] = await this.db.client.query<RowDataPacket[]>(dataSQL, [
      ...values,
      limit,
      skip,
    ]);

    return {
      data: dataRows as ISaleReport[],
      meta: {
        skip,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDetailSaleReport(id: string): Promise<ISaleReport> {
    const [rows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT * FROM saleReport WHERE sale_id = ?',
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Sales report with ID '${id}' not found`);
    }
    return rows[0] as ISaleReport;
  }

  async createSaleReport(dto: CreateSaleReportDto, adminUsername?: string): Promise<ISaleReport> {
    const id = `SR${Date.now()}`;
    await this.db.client.query<ResultSetHeader>(
      `INSERT INTO saleReport (sale_id, product_id, customer_id, sold_quantity, distribution_channel, branch_id, time_report) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.product_id,
        dto.customer_id,
        dto.sold_quantity,
        dto.distribution_channel,
        dto.branch_id,
        dto.time_report,
      ],
    );

    await this.notificationService.createNotification({
      title: 'Tạo báo cáo bán hàng mới',
      content: `Admin ${adminUsername || 'hệ thống'} đã thêm mới báo cáo doanh số ${id} cho sản phẩm ${dto.product_id} (Số lượng: ${dto.sold_quantity}).`,
      type: 'SYSTEM',
    });

    return this.getDetailSaleReport(id);
  }

  async updateSaleReport(
    dto: CreateSaleReportDto,
    id: string,
    adminUsername?: string,
  ): Promise<ISaleReport> {
    await this.getDetailSaleReport(id);
    await this.db.client.query<ResultSetHeader>(
      `UPDATE saleReport SET product_id = ?, customer_id = ?, sold_quantity = ?, distribution_channel = ?, branch_id = ?, time_report = ? WHERE sale_id = ?`,
      [
        dto.product_id,
        dto.customer_id,
        dto.sold_quantity,
        dto.distribution_channel,
        dto.branch_id,
        dto.time_report,
        id,
      ],
    );

    await this.notificationService.createNotification({
      title: 'Cập nhật báo cáo bán hàng',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật thông tin báo cáo doanh số ${id}.`,
      type: 'SYSTEM',
    });

    return this.getDetailSaleReport(id);
  }

  async deleteSaleReport(id: string, adminUsername?: string): Promise<boolean> {
    await this.getDetailSaleReport(id);
    const [result] = await this.db.client.query<ResultSetHeader>(
      'DELETE FROM saleReport WHERE sale_id = ?',
      [id],
    );
    const success = result.affectedRows > 0;

    if (success) {
      await this.notificationService.createNotification({
        title: 'Xóa báo cáo bán hàng',
        content: `Admin ${adminUsername || 'hệ thống'} đã xóa báo cáo doanh số ${id}.`,
        type: 'SYSTEM',
      });
    }

    return success;
  }

  async getSaleReportStats(): Promise<{
    distribution_channel: { name: string; count: number }[];
    monthly_sales: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  }> {
    const [channelRows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT distribution_channel as name, SUM(sold_quantity) as count FROM saleReport GROUP BY distribution_channel',
    );
    const [monthlyRows] = await this.db.client.query<RowDataPacket[]>(
      "SELECT DATE_FORMAT(time_report, '%Y-%m') as name, SUM(sold_quantity) as count FROM saleReport GROUP BY DATE_FORMAT(time_report, '%Y-%m') ORDER BY name DESC LIMIT 6",
    );
    const [branchRows] = await this.db.client.query<RowDataPacket[]>(
      'SELECT branch_id as name, SUM(sold_quantity) as count FROM saleReport GROUP BY branch_id ORDER BY count DESC LIMIT 5',
    );

    return {
      distribution_channel: channelRows.map(r => ({ name: String(r.name), count: Number(r.count ?? 0) })),
      monthly_sales: monthlyRows.reverse().map(r => ({ name: String(r.name), count: Number(r.count ?? 0) })),
      top_branches: branchRows.map(r => ({ name: String(r.name), count: Number(r.count ?? 0) })),
    };
  }
}
