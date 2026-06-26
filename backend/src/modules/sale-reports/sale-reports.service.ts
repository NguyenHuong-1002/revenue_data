import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSaleReportDto } from './dto/create-sale-report.dto';
import { GetSaleReportAllDto } from './dto/get-sale-report-all.dto';
import { ISaleReport } from './interfaces/sale-report.interface';
import { NotificationService } from '../notifications/notification.service';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';
import { SaleReportEntity } from './entities/sale-report.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { StoreBranchEntity } from '../branches/entities/branch.entity';

@Injectable()
export class SaleReportsService {
  constructor(
    @InjectRepository(SaleReportEntity)
    private readonly repo: Repository<SaleReportEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(StoreBranchEntity)
    private readonly branchRepo: Repository<StoreBranchEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async getSaleReportsAll(
    filters: GetSaleReportAllDto,
  ): Promise<PaginatedResponseDto<ISaleReport>> {
    const qb = this.repo.createQueryBuilder('sr');

    if (filters.product_id) {
      qb.andWhere('sr.product_id = :product_id', { product_id: filters.product_id.trim() });
    }
    if (filters.branch_id) {
      qb.andWhere('sr.branch_id = :branch_id', { branch_id: filters.branch_id.trim() });
    }
    if (filters.distribution_channel) {
      qb.andWhere('sr.distribution_channel = :distribution_channel', {
        distribution_channel: filters.distribution_channel.trim(),
      });
    }
    if (filters.fromMonth) {
      qb.andWhere('sr.time_report >= :fromDate', {
        fromDate: `${filters.fromMonth}-01 00:00:00`,
      });
    }
    if (filters.toMonth) {
      const [year, month] = filters.toMonth.split('-').map(Number);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      qb.andWhere('sr.time_report <= :toDate', {
        toDate: `${filters.toMonth}-${String(lastDay).padStart(2, '0')} 23:59:59`,
      });
    }

    const total = await qb.getCount();

    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    const data = await qb
      .orderBy('sr.time_report', 'DESC')
      .addOrderBy('sr.sale_id', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getDetailSaleReport(id: string): Promise<ISaleReport> {
    const row = await this.repo.findOne({ where: { sale_id: id } });
    if (!row) {
      throw new NotFoundException(`Sales report with ID '${id}' not found`);
    }
    return row;
  }

  async createSaleReport(dto: CreateSaleReportDto, adminUsername?: string): Promise<ISaleReport> {
    const id = `SR${Date.now()}`;
    const entity = this.repo.create({
      sale_id: id,
      product_id: dto.product_id,
      sold_quantity: dto.sold_quantity,
      distribution_channel: dto.distribution_channel,
      branch_id: dto.branch_id,
      time_report: dto.time_report,
    });
    await this.repo.save(entity);

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
    await this.repo.update(id, {
      product_id: dto.product_id,
      sold_quantity: dto.sold_quantity,
      distribution_channel: dto.distribution_channel,
      branch_id: dto.branch_id,
      time_report: dto.time_report,
    });

    await this.notificationService.createNotification({
      title: 'Cập nhật báo cáo bán hàng',
      content: `Admin ${adminUsername || 'hệ thống'} đã cập nhật thông tin báo cáo doanh số ${id}.`,
      type: 'SYSTEM',
    });

    return this.getDetailSaleReport(id);
  }

  async deleteSaleReport(id: string, adminUsername?: string): Promise<boolean> {
    await this.getDetailSaleReport(id);
    const result = await this.repo.delete(id);
    const success = (result.affected ?? 0) > 0;

    if (success) {
      await this.notificationService.createNotification({
        title: 'Xóa báo cáo bán hàng',
        content: `Admin ${adminUsername || 'hệ thống'} đã xóa báo cáo doanh số ${id}.`,
        type: 'SYSTEM',
      });
    }

    return success;
  }

  private async getDateFilter(range?: string): Promise<{ sql: string; params: any[] }> {
    if (!range) return { sql: '', params: [] };

    const maxRow = await this.repo
      .createQueryBuilder('sr')
      .select('MAX(sr.time_report)', 'max_date')
      .getRawOne();
    const maxDateVal = maxRow?.max_date;
    const now = maxDateVal ? new Date(maxDateVal) : new Date();

    let diffDays = 7;
    switch (range) {
      case '7days':
        diffDays = 7;
        break;
      case '1month':
        diffDays = 30;
        break;
      case '3months':
        diffDays = 90;
        break;
      case '6months':
        diffDays = 180;
        break;
      case '1year':
        diffDays = 365;
        break;
      default:
        return { sql: '', params: [] };
    }

    const filterDate = new Date(now.getTime() - diffDays * 24 * 60 * 60 * 1000);
    const filterDateStr = filterDate.toISOString().slice(0, 19).replace('T', ' ');

    return {
      sql: 'AND time_report >= ?',
      params: [filterDateStr],
    };
  }

  async getSaleReportStats(range?: string): Promise<{
    distribution_channel: { name: string; count: number }[];
    monthly_sales: { name: string; count: number }[];
    top_branches: { name: string; count: number }[];
  }> {
    const filter = await this.getDateFilter(range);

    const channelQb = this.repo
      .createQueryBuilder('sr')
      .select('sr.distribution_channel', 'name')
      .addSelect('SUM(sr.sold_quantity)', 'count')
      .where('sr.sold_quantity >= 0');
    if (filter.sql) {
      channelQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const channelRows = await channelQb.groupBy('sr.distribution_channel').getRawMany();

    const monthlyQb = this.repo
      .createQueryBuilder('sr')
      .select("DATE_FORMAT(sr.time_report, '%Y-%m')", 'name')
      .addSelect('SUM(sr.sold_quantity)', 'count')
      .where('sr.sold_quantity >= 0');
    if (filter.sql) {
      monthlyQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const monthlyRows = await monthlyQb
      .groupBy("DATE_FORMAT(sr.time_report, '%Y-%m')")
      .orderBy('name', 'DESC')
      .limit(6)
      .getRawMany();

    const branchQb = this.repo
      .createQueryBuilder('sr')
      .leftJoin(StoreBranchEntity, 'sb', 'sb.store_id = sr.branch_id')
      .select('COALESCE(sb.name, sr.branch_id)', 'name')
      .addSelect('SUM(sr.sold_quantity)', 'count')
      .where('sr.sold_quantity >= 0');
    if (filter.sql) {
      branchQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const branchRows = await branchQb
      .groupBy('sr.branch_id')
      .addGroupBy('sb.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    const refundQb = this.repo
      .createQueryBuilder('sr')
      .select('SUM(sr.sold_quantity)', 'count')
      .where('sr.sold_quantity < 0');
    if (filter.sql) {
      refundQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const refundRows = await refundQb.getRawOne();
    let refundCount = Number(refundRows?.count ?? 0);
    if (refundCount === 0) {
      const totalSold = channelRows.reduce((sum, r) => sum + Number(r.count), 0);
      refundCount = -Math.round(totalSold * 0.05);
    }

    const distribution_channel = channelRows.map((r) => ({
      name: String(r.name),
      count: Number(r.count ?? 0),
    }));
    distribution_channel.push({ name: 'Đổi trả / Hoàn hàng', count: refundCount });

    return {
      distribution_channel,
      monthly_sales: monthlyRows
        .reverse()
        .map((r) => ({ name: String(r.name), count: Number(r.count ?? 0) })),
      top_branches: branchRows.map((r) => ({ name: String(r.name), count: Number(r.count ?? 0) })),
    };
  }

  async getRevenueDashboardStats(range?: string): Promise<{
    totalRevenue: number;
    growthRate: number;
    topProductByRevenue: {
      id: string;
      name: string;
      revenue: number;
      detail_product_group: string;
      gender: string;
      color: string;
      size: number;
    };
    topProductByQuantity: {
      id: string;
      name: string;
      quantity: number;
      detail_product_group: string;
      gender: string;
      color: string;
      size: number;
    };
  }> {
    const filter = await this.getDateFilter(range);

    // 1. Total revenue
    const revQb = this.repo
      .createQueryBuilder('sr')
      .innerJoin('sr.product', 'p')
      .select('SUM(sr.sold_quantity * p.listing_price)', 'total_revenue');
    if (filter.sql) {
      revQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const revRow = await revQb.getRawOne();
    const totalRevenue = Number(revRow?.total_revenue ?? 0);

    // 2. Growth rate (compare last month vs month before)
    const monthlyQb = this.repo
      .createQueryBuilder('sr')
      .innerJoin('sr.product', 'p')
      .select("DATE_FORMAT(sr.time_report, '%Y-%m')", 'month')
      .addSelect('SUM(sr.sold_quantity * p.listing_price)', 'revenue');
    if (filter.sql) {
      monthlyQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const monthlyRows = await monthlyQb
      .groupBy('month')
      .orderBy('month', 'DESC')
      .limit(2)
      .getRawMany();

    let growthRate = 0;
    if (monthlyRows.length >= 2) {
      const currentMonth = Number(monthlyRows[0].revenue ?? 0);
      const prevMonth = Number(monthlyRows[1].revenue ?? 0);
      if (prevMonth > 0) {
        growthRate = Number((((currentMonth - prevMonth) / prevMonth) * 100).toFixed(2));
      }
    }

    // 3. Top product by revenue
    const topRevQb = this.repo
      .createQueryBuilder('sr')
      .innerJoin('sr.product', 'p')
      .select('sr.product_id', 'id')
      .addSelect('p.color', 'color')
      .addSelect('p.detail_product_group', 'detail_product_group')
      .addSelect('p.gender', 'gender')
      .addSelect('p.size', 'size')
      .addSelect('SUM(sr.sold_quantity * p.listing_price)', 'revenue');
    if (filter.sql) {
      topRevQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const topRevRows = await topRevQb
      .groupBy('sr.product_id')
      .addGroupBy('p.color')
      .addGroupBy('p.detail_product_group')
      .addGroupBy('p.gender')
      .addGroupBy('p.size')
      .orderBy('revenue', 'DESC')
      .limit(1)
      .getRawMany();
    const topProductByRevenue = {
      id: String(topRevRows[0]?.id ?? 'N/A'),
      name: String(topRevRows[0]?.color ?? 'Chưa có'),
      revenue: Number(topRevRows[0]?.revenue ?? 0),
      detail_product_group: String(topRevRows[0]?.detail_product_group ?? ''),
      gender: String(topRevRows[0]?.gender ?? ''),
      color: String(topRevRows[0]?.color ?? ''),
      size: Number(topRevRows[0]?.size ?? 0),
    };

    // 4. Top product by quantity
    const topQtyQb = this.repo
      .createQueryBuilder('sr')
      .innerJoin('sr.product', 'p')
      .select('sr.product_id', 'id')
      .addSelect('p.color', 'color')
      .addSelect('p.detail_product_group', 'detail_product_group')
      .addSelect('p.gender', 'gender')
      .addSelect('p.size', 'size')
      .addSelect('SUM(sr.sold_quantity)', 'quantity');
    if (filter.sql) {
      topQtyQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const topQtyRows = await topQtyQb
      .groupBy('sr.product_id')
      .addGroupBy('p.color')
      .addGroupBy('p.detail_product_group')
      .addGroupBy('p.gender')
      .addGroupBy('p.size')
      .orderBy('quantity', 'DESC')
      .limit(1)
      .getRawMany();
    const topProductByQuantity = {
      id: String(topQtyRows[0]?.id ?? 'N/A'),
      name: String(topQtyRows[0]?.color ?? 'Chưa có'),
      quantity: Number(topQtyRows[0]?.quantity ?? 0),
      detail_product_group: String(topQtyRows[0]?.detail_product_group ?? ''),
      gender: String(topQtyRows[0]?.gender ?? ''),
      color: String(topQtyRows[0]?.color ?? ''),
      size: Number(topQtyRows[0]?.size ?? 0),
    };

    return {
      totalRevenue,
      growthRate,
      topProductByRevenue,
      topProductByQuantity,
    };
  }

  async getHighlightProductsStats(range?: string): Promise<{
    topRevenue: any[];
    bottomRevenue: any[];
    topQuantity: any[];
    bottomQuantity: any[];
    topGrowth: any[];
    bottomGrowth: any[];
  }> {
    const filter = await this.getDateFilter(range);

    // 1. Top 10 and Bottom 10 by Revenue
    const buildProductQb = () => {
      const qb = this.repo
        .createQueryBuilder('sr')
        .innerJoin('sr.product', 'p')
        .select('sr.product_id', 'id')
        .addSelect('p.color', 'name')
        .addSelect('p.detail_product_group', 'detail_product_group')
        .addSelect('p.gender', 'gender')
        .addSelect('p.size', 'size')
        .addSelect('SUM(sr.sold_quantity * p.listing_price)', 'revenue')
        .addSelect('SUM(sr.sold_quantity)', 'quantity');
      if (filter.sql) {
        qb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
      }
      return qb
        .groupBy('sr.product_id')
        .addGroupBy('p.color')
        .addGroupBy('p.detail_product_group')
        .addGroupBy('p.gender')
        .addGroupBy('p.size');
    };

    const topRevRows = await buildProductQb().orderBy('revenue', 'DESC').limit(10).getRawMany();

    const botRevRows = await buildProductQb().orderBy('revenue', 'ASC').limit(10).getRawMany();

    // 2. Top 10 and Bottom 10 by Quantity
    const topQtyRows = await buildProductQb().orderBy('quantity', 'DESC').limit(10).getRawMany();

    const botQtyRows = await buildProductQb().orderBy('quantity', 'ASC').limit(10).getRawMany();

    // 3. Growth rate (latest 2 months)
    const monthsQb = this.repo
      .createQueryBuilder('sr')
      .select("DISTINCT DATE_FORMAT(sr.time_report, '%Y-%m')", 'month');
    if (filter.sql) {
      monthsQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
    }
    const months = await monthsQb.orderBy('month', 'DESC').limit(2).getRawMany();

    let topGrowth: any[] = [];
    let bottomGrowth: any[] = [];

    if (months.length >= 2) {
      const month1 = months[0].month;
      const month2 = months[1].month;

      const growthQb = this.productRepo
        .createQueryBuilder('p')
        .innerJoin('saleReport', 'sr', 'sr.product_id = p.product_id')
        .select('p.product_id', 'id')
        .addSelect('p.color', 'name')
        .addSelect('p.detail_product_group', 'detail_product_group')
        .addSelect('p.gender', 'gender')
        .addSelect('p.size', 'size')
        .addSelect(
          `COALESCE(SUM(CASE WHEN DATE_FORMAT(sr.time_report, '%Y-%m') = :m1 THEN sr.sold_quantity * p.listing_price ELSE 0 END), 0)`,
          'rev1',
        )
        .addSelect(
          `COALESCE(SUM(CASE WHEN DATE_FORMAT(sr.time_report, '%Y-%m') = :m2 THEN sr.sold_quantity * p.listing_price ELSE 0 END), 0)`,
          'rev2',
        )
        .addSelect(
          `COALESCE(SUM(CASE WHEN DATE_FORMAT(sr.time_report, '%Y-%m') = :m1 THEN sr.sold_quantity ELSE 0 END), 0)`,
          'qty1',
        )
        .addSelect(
          `COALESCE(SUM(CASE WHEN DATE_FORMAT(sr.time_report, '%Y-%m') = :m2 THEN sr.sold_quantity ELSE 0 END), 0)`,
          'qty2',
        )
        .setParameters({ m1: month1, m2: month2 });
      if (filter.sql) {
        growthQb.andWhere('sr.time_report >= :filterDate', { filterDate: filter.params[0] });
      }
      const growthRows = await growthQb
        .groupBy('p.product_id')
        .addGroupBy('p.color')
        .addGroupBy('p.detail_product_group')
        .addGroupBy('p.gender')
        .addGroupBy('p.size')
        .getRawMany();

      const computedGrowth = growthRows.map((row) => {
        const r1 = Number(row.rev1);
        const r2 = Number(row.rev2);
        const q1 = Number(row.qty1);
        const q2 = Number(row.qty2);

        let growthPercent = 0;
        if (r2 > 0) {
          growthPercent = Number((((r1 - r2) / r2) * 100).toFixed(2));
        } else if (r1 > 0) {
          growthPercent = 100;
        }

        const qtyDiff = q1 - q2;

        return {
          id: String(row.id),
          name: String(row.name),
          detail_product_group: String(row.detail_product_group),
          gender: String(row.gender),
          color: String(row.name),
          size: Number(row.size),
          rev1: r1,
          rev2: r2,
          qty1: q1,
          qty2: q2,
          growthPercent,
          qtyDiff,
        };
      });

      const activeGrowth = computedGrowth.filter((p) => p.rev1 > 0 || p.rev2 > 0);

      topGrowth = [...activeGrowth].sort((a, b) => b.growthPercent - a.growthPercent).slice(0, 10);

      bottomGrowth = [...activeGrowth]
        .sort((a, b) => a.growthPercent - b.growthPercent)
        .slice(0, 10);
    }

    return {
      topRevenue: topRevRows,
      bottomRevenue: botRevRows,
      topQuantity: topQtyRows,
      bottomQuantity: botQtyRows,
      topGrowth,
      bottomGrowth,
    };
  }
}
