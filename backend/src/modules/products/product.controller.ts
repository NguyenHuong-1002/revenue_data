import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';

import * as authGuard from 'src/guards/auth.guard';
import { IProduct } from './interfaces/product.interface';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductAllDto } from './dto/get-product-all.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

/**
 * Controller quản lý sản phẩm
 * Routes: /products
 */
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * [PUBLIC] Lấy danh sách sản phẩm (phân trang, lọc, tìm kiếm)
   * GET /products?page=1&limit=10&color=xxx
   */
  @authGuard.Roles('PUBLIC')
  @Get()
  @HttpCode(HttpStatus.OK)
  getProducts(
    @Query(new ValidationPipe({ transform: true })) query: GetProductAllDto,
  ): Promise<PaginatedResponseDto<IProduct>> {
    return this.productService.getProductsAll(query);
  }

  /**
   * [ADMIN] Tạo sản phẩm mới
   * POST /products
   */
  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProduct(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) productDTO: CreateProductDto,
  ): Promise<IProduct> {
    return this.productService.createProduct(productDTO, admin.username);
  }

  /**
   * [PUBLIC] Lấy thống kê sản phẩm theo nhóm
   * GET /products/stats
   */
  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  getProductStats(): Promise<{
    gender: { name: string; count: number }[];
    age_group: { name: string; count: number }[];
    activity_group: { name: string; count: number }[];
    lifestyle_group: { name: string; count: number }[];
  }> {
    return this.productService.getProductStats();
  }

  /**
   * [PUBLIC] Lấy chi tiết sản phẩm theo ID
   * GET /products/:id
   */
  @Get('/:id')
  getProductById(@Param('id') id: string): Promise<IProduct> {
    return this.productService.getDetailProduct(id);
  }

  /**
   * [ADMIN] Cập nhật sản phẩm
   * PUT /products/:id
   */
  @authGuard.Roles('ADMIN')
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  updateProduct(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) productDTO: CreateProductDto,
    @Param('id') id: string,
  ): Promise<IProduct> {
    return this.productService.updateProduct(productDTO, id, admin.username);
  }

  /**
   * [ADMIN] Xóa sản phẩm
   * DELETE /products/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.productService.deleteProduct(id, admin.username);
  }
}
