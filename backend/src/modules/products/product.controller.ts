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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import * as authGuard from 'src/middlewares/auth.guard';
import { IProduct, IPaginatedProducts } from './interfaces/product.interface';
import { ProductService } from './product.service';
import { CreateProductDto } from './DTO/create-product.dto';
import { GetProductAllDto } from './DTO/get-product-all.dto';

@UseGuards(authGuard.AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getProducts(
    @Query(new ValidationPipe({ transform: true })) query: GetProductAllDto,
  ): Promise<IPaginatedProducts> {
    return this.productService.getProductsAll(query);
  }

  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProduct(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) productDTO: CreateProductDto,
  ): Promise<IProduct> {
    return this.productService.createProduct(productDTO, admin.username);
  }

  @Get('/stats')
  @HttpCode(HttpStatus.OK)
  getProductStats(): Promise<any> {
    return this.productService.getProductStats();
  }

  @Get('/:id')
  getDetailProduct(@Param('id') id: string): Promise<IProduct> {
    return this.productService.getDetailProduct(id);
  }

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
