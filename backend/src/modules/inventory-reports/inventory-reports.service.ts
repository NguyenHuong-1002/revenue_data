import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryReportDto } from './dto/create-inventory-report.dto';
import { GetInventoryReportAllDto } from './dto/get-inventory-report-all.dto';
import { IInventoryReport } from './interfaces/inventory-report.interface';
import { NotificationService } from '../notifications/notification.service';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { InventoryReportEntity } from './entities/inventory-report.entity';

@Injectable()
export class InventoryReportsService {
  constructor(
    @InjectRepository(InventoryReportEntity)
    private readonly repo: Repository<InventoryReportEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async getInventoryReportsAll(
    filters: GetInventoryReportAllDto,
  ): Promise<PaginatedResponseDto<IInventoryReport>> {
    const qb = this.repo.createQueryBuilder('ir');

    if (filters.product_id) {
      qb.andWhere('ir.product_id = :product_id', { product_id: filters.product_id.trim() });
    }
    if (filters.plant_id) {
      qb.andWhere('ir.plant_id = :plant_id', { plant_id: filters.plant_id.trim() });
    }
    if (filters.fromMonth) {
      qb.andWhere('ir.calendar_year_week >= :fromMonth', {
        fromMonth: `${filters.fromMonth}-01 00:00:00`,
      });
    }
    if (filters.toMonth) {
      const [year, month] = filters.toMonth.split('-').map(Number);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      qb.andWhere('ir.calendar_year_week <= :toMonth', {
        toMonth: `${filters.toMonth}-${String(lastDay).padStart(2, '0')} 23:59:59`,
      });
    }

    const total = await qb.getCount();

    const { page, limit } = filters;
    const data = await qb
      .orderBy('ir.calendar_year_week', 'DESC')
      .addOrderBy('ir.inventory_id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getDetailInventoryReport(id: string): Promise<IInventoryReport> {
    const row = await this.repo.findOne({ where: { inventory_id: id } });
    if (!row) {
      throw new NotFoundException(`Inventory report with ID '${id}' not found`);
    }
    return row;
  }

  async createInventoryReport(
    dto: CreateInventoryReportDto,
    adminUsername?: string,
  ): Promise<IInventoryReport> {
    const id = `INV${Date.now()}`;
    const entity = this.repo.create({
      inventory_id: id,
      product_id: dto.product_id,
      plant_id: dto.plant_id,
      calendar_year_week: dto.calendar_year_week,
      quantity: dto.quantity,
    });
    await this.repo.save(entity);

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
    const existing = await this.getDetailInventoryReport(id);
    this.repo.merge(existing, {
      product_id: dto.product_id,
      plant_id: dto.plant_id,
      calendar_year_week: dto.calendar_year_week,
      quantity: dto.quantity,
    });
    await this.repo.save(existing);

    await this.notificationService.createNotification({
      title: 'Cập nhật báo cáo tồn kho',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật thông tin báo cáo tồn kho ${id}.`,
      type: 'SYSTEM',
    });

    return this.getDetailInventoryReport(id);
  }

  async deleteInventoryReport(id: string, adminUsername?: string): Promise<boolean> {
    await this.getDetailInventoryReport(id);
    const result = await this.repo.delete({ inventory_id: id });
    const success = (result.affected ?? 0) > 0;

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
    const plantRows = await this.repo
      .createQueryBuilder('ir')
      .select('ir.plant_id', 'name')
      .addSelect('SUM(ir.quantity)', 'count')
      .groupBy('ir.plant_id')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const monthlyRows = await this.repo
      .createQueryBuilder('ir')
      .select("DATE_FORMAT(ir.calendar_year_week, '%Y-%m')", 'name')
      .addSelect('SUM(ir.quantity)', 'count')
      .groupBy("DATE_FORMAT(ir.calendar_year_week, '%Y-%m')")
      .orderBy('name', 'DESC')
      .limit(6)
      .getRawMany();

    return {
      plant_inventory: plantRows.map((r) => ({
        name: String(r.name),
        count: Number(r.count ?? 0),
      })),
      monthly_inventory: monthlyRows
        .reverse()
        .map((r) => ({ name: String(r.name), count: Number(r.count ?? 0) })),
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
    const totalsRow = await this.repo
      .createQueryBuilder('ir')
      .select('SUM(ir.quantity)', 'totalStock')
      .addSelect('COUNT(*)', 'totalRecords')
      .addSelect('COUNT(DISTINCT ir.plant_id)', 'totalPlants')
      .addSelect('COUNT(DISTINCT ir.product_id)', 'totalProducts')
      .getRawOne();

    const curRow = await this.repo
      .createQueryBuilder('ir')
      .select('SUM(ir.quantity)', 'stock')
      .where("DATE_FORMAT(ir.calendar_year_week,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')")
      .getRawOne();

    const prevRow = await this.repo
      .createQueryBuilder('ir')
      .select('SUM(ir.quantity)', 'stock')
      .where(
        "DATE_FORMAT(ir.calendar_year_week,'%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH),'%Y-%m')",
      )
      .getRawOne();

    const topPlantRow = await this.repo
      .createQueryBuilder('ir')
      .select('ir.plant_id', 'plant_id')
      .addSelect('SUM(ir.quantity)', 'total')
      .groupBy('ir.plant_id')
      .orderBy('total', 'DESC')
      .limit(1)
      .getRawOne();

    const topProductRow = await this.repo
      .createQueryBuilder('ir')
      .select('ir.product_id', 'product_id')
      .addSelect('SUM(ir.quantity)', 'total')
      .groupBy('ir.product_id')
      .orderBy('total', 'DESC')
      .limit(1)
      .getRawOne();

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
      topPlant: topPlantRow
        ? { plant_id: String(topPlantRow.plant_id), total: Number(topPlantRow.total) }
        : null,
      topProduct: topProductRow
        ? { product_id: String(topProductRow.product_id), total: Number(topProductRow.total) }
        : null,
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
    const topRows = await this.repo
      .createQueryBuilder('ir')
      .select('ir.product_id', 'product_id')
      .addSelect('SUM(ir.quantity)', 'total')
      .groupBy('ir.product_id')
      .orderBy('total', 'DESC')
      .limit(topN)
      .getRawMany();

    const bottomRows = await this.repo
      .createQueryBuilder('ir')
      .select('ir.product_id', 'product_id')
      .addSelect('SUM(ir.quantity)', 'total')
      .groupBy('ir.product_id')
      .orderBy('total', 'ASC')
      .limit(topN)
      .getRawMany();

    const plantRows = await this.repo
      .createQueryBuilder('ir')
      .select('ir.plant_id', 'plant_id')
      .addSelect('SUM(ir.quantity)', 'total')
      .addSelect('COUNT(*)', 'record_count')
      .groupBy('ir.plant_id')
      .orderBy('total', 'DESC')
      .limit(topN)
      .getRawMany();

    const monthlyRows = await this.repo
      .createQueryBuilder('ir')
      .select("DATE_FORMAT(ir.calendar_year_week,'%Y-%m')", 'month')
      .addSelect('SUM(ir.quantity)', 'total')
      .groupBy("DATE_FORMAT(ir.calendar_year_week,'%Y-%m')")
      .orderBy('month', 'ASC')
      .getRawMany();

    const monthlyWithGrowth = monthlyRows.map((row, i) => {
      const prev = i > 0 ? Number(monthlyRows[i - 1].total ?? 0) : 0;
      const cur = Number(row.total ?? 0);
      const growthPct = prev > 0 ? Number((((cur - prev) / prev) * 100).toFixed(2)) : null;
      return { month: String(row.month), total: cur, growthPct };
    });

    return {
      topStocked: topRows.map((r) => ({
        product_id: String(r.product_id),
        total: Number(r.total),
      })),
      bottomStocked: bottomRows.map((r) => ({
        product_id: String(r.product_id),
        total: Number(r.total),
      })),
      topPlants: plantRows.map((r) => ({
        plant_id: String(r.plant_id),
        total: Number(r.total),
        record_count: Number(r.record_count),
      })),
      monthlyTrend: monthlyWithGrowth,
    };
  }

  /* ═══════════════════════════════════════
     INVENTORY STATS — Cảnh báo tồn kho
  ═══════════════════════════════════════ */
  async getInventoryAlerts(
    lowThreshold = 50,
    highThreshold = 10000,
  ): Promise<{
    lowStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
    highStock: { product_id: string; plant_id: string; quantity: number; last_date: string }[];
    totalAlerts: number;
  }> {
    const lowRows = await this.repo
      .createQueryBuilder('ir')
      .select('ir.product_id', 'product_id')
      .addSelect('ir.plant_id', 'plant_id')
      .addSelect('ir.quantity', 'quantity')
      .addSelect("DATE_FORMAT(ir.calendar_year_week,'%Y-%m-%d')", 'last_date')
      .where('ir.quantity <= :lowThreshold AND ir.quantity > 0', { lowThreshold })
      .orderBy('ir.quantity', 'ASC')
      .limit(20)
      .getRawMany();

    const highRows = await this.repo
      .createQueryBuilder('ir')
      .select('ir.product_id', 'product_id')
      .addSelect('ir.plant_id', 'plant_id')
      .addSelect('ir.quantity', 'quantity')
      .addSelect("DATE_FORMAT(ir.calendar_year_week,'%Y-%m-%d')", 'last_date')
      .where('ir.quantity >= :highThreshold', { highThreshold })
      .orderBy('ir.quantity', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      lowStock: lowRows.map((r) => ({
        product_id: String(r.product_id),
        plant_id: String(r.plant_id),
        quantity: Number(r.quantity),
        last_date: String(r.last_date),
      })),
      highStock: highRows.map((r) => ({
        product_id: String(r.product_id),
        plant_id: String(r.plant_id),
        quantity: Number(r.quantity),
        last_date: String(r.last_date),
      })),
      totalAlerts: lowRows.length + highRows.length,
    };
  }
}
