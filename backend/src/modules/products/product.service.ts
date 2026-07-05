import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductAllDto } from './dto/get-product-all.dto';
import { IProduct } from './interfaces/product.interface';
import { NotificationService } from '../notifications/notification.service';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async getProductsAll(filters: GetProductAllDto): Promise<PaginatedResponseDto<IProduct>> {
    const { page, limit, ...whereFilters } = filters;
    const skip = (page - 1) * limit;

    const qb = this.createFilteredQuery(whereFilters);

    const [data, total] = await qb
      .orderBy('product.product_id', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  // todo Bộ lọc tìm kiếm
  private createFilteredQuery(
    filters: Omit<GetProductAllDto, 'page' | 'limit'>,
  ): SelectQueryBuilder<ProductEntity> {
    const qb = this.productRepository.createQueryBuilder('product');

    if (filters.product_id) {
      qb.andWhere('product.product_id = :product_id', { product_id: filters.product_id.trim() });
    }
    if (filters.color) {
      qb.andWhere('product.color LIKE :color', { color: `%${filters.color.trim()}%` });
    }
    if (filters.listing_price !== undefined) {
      qb.andWhere('product.listing_price = :listing_price', {
        listing_price: filters.listing_price,
      });
    }
    if (filters.price_cost !== undefined) {
      qb.andWhere('product.price_cost = :price_cost', { price_cost: filters.price_cost });
    }
    if (filters.gender) {
      const normalizedGender = this.normalizeGenderFilter(filters.gender);
      if (normalizedGender) {
        qb.andWhere('product.gender = :gender', { gender: normalizedGender });
      }
    }
    if (filters.detail_product_group) {
      qb.andWhere('product.detail_product_group = :detail_product_group', {
        detail_product_group: filters.detail_product_group.trim(),
      });
    }
    if (filters.size !== undefined) {
      qb.andWhere('product.size = :size', { size: filters.size });
    }
    if (filters.age_group !== undefined) {
      qb.andWhere('product.age_group = :age_group', { age_group: filters.age_group.trim() });
    }
    if (filters.activity_group) {
      qb.andWhere('product.activity_group = :activity_group', {
        activity_group: filters.activity_group.trim(),
      });
    }
    if (filters.lifestyle_group) {
      qb.andWhere('product.lifestyle_group = :lifestyle_group', {
        lifestyle_group: filters.lifestyle_group.trim(),
      });
    }

    return qb;
  }

  private normalizeGenderFilter(value: string): string {
    const normalized = value.trim().toLowerCase();

    if (['men', 'nam'].includes(normalized)) {
      return 'MEN';
    }

    if (['wom', 'nu', 'nữ'].includes(normalized)) {
      return 'WOM';
    }

    if (['boy', 'bé trai', 'be trai'].includes(normalized)) {
      return 'BOY';
    }

    if (['gir', 'bé gái', 'be gai', 'girl'].includes(normalized)) {
      return 'GIR';
    }

    return 'MEN'; // fallback default
  }

  async getProductStats(): Promise<{
    gender: { name: string; count: number }[];
    age_group: { name: string; count: number }[];
    activity_group: { name: string; count: number }[];
    lifestyle_group: { name: string; count: number }[];
  }> {
    const genderStats = await this.productRepository
      .createQueryBuilder('product')
      .select('product.gender', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.gender')
      .getRawMany();

    const ageStats = await this.productRepository
      .createQueryBuilder('product')
      .select('product.age_group', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.age_group')
      .getRawMany();

    const activityStats = await this.productRepository
      .createQueryBuilder('product')
      .select('product.activity_group', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.activity_group')
      .getRawMany();

    const lifestyleStats = await this.productRepository
      .createQueryBuilder('product')
      .select('product.lifestyle_group', 'name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.lifestyle_group')
      .getRawMany();

    return {
      gender: genderStats,
      age_group: ageStats,
      activity_group: activityStats,
      lifestyle_group: lifestyleStats,
    };
  }

  async getDetailProduct(id: string): Promise<IProduct> {
    const product = await this.productRepository.findOneBy({ product_id: id });
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async createProduct(dto: CreateProductDto, adminUsername?: string): Promise<IProduct> {
    const id = `SP${Date.now()}`;
    const product = this.productRepository.create({
      product_id: id,
      color: dto.color,
      listing_price: dto.listing_price,
      price_cost: dto.price_cost,
      gender: this.normalizeGenderFilter(dto.gender) as ProductEntity['gender'],
      detail_product_group: dto.detail_product_group as ProductEntity['detail_product_group'],
      size: dto.size,
      age_group: dto.age_group as ProductEntity['age_group'],
      activity_group: dto.activity_group as ProductEntity['activity_group'],
      lifestyle_group: dto.lifestyle_group as ProductEntity['lifestyle_group'],
    });

    await this.productRepository.save(product);

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
    const existingProduct = await this.getDetailProduct(id);

    const updateData: Partial<ProductEntity> = {
      color: dto.color,
      listing_price: dto.listing_price,
      price_cost: dto.price_cost,
      gender: this.normalizeGenderFilter(dto.gender) as ProductEntity['gender'],
      detail_product_group: dto.detail_product_group as ProductEntity['detail_product_group'],
      size: dto.size,
      age_group: dto.age_group as ProductEntity['age_group'],
      activity_group: dto.activity_group as ProductEntity['activity_group'],
      lifestyle_group: dto.lifestyle_group as ProductEntity['lifestyle_group'],
    };

    await this.productRepository.update({ product_id: id }, updateData);

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
    const result = await this.productRepository.delete({ product_id: id });
    const success = (result.affected ?? 0) > 0;

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
