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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiGetProductsSwagger,
  ApiPostProductSwagger,
  ApiGetDetailProductSwagger,
  ApiUpdateProductSwagger,
  ApiDeleteProductSwagger,
} from './product.swagger';

@ApiTags('Sản phẩm (Products)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @ApiGetProductsSwagger()
  @Get()
  @HttpCode(HttpStatus.OK)
  getProductsController(
    @Query(new ValidationPipe({ transform: true })) query: GetProductAllDto,
  ): Promise<IPaginatedProducts> {
    return this.productService.getProductsAll(query);
  }

  @authGuard.Roles('ADMIN')
  @ApiPostProductSwagger()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  postProduct(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) productDTO: CreateProductDto,
  ): Promise<IProduct> {
    return this.productService.createProduct(productDTO, admin.username);
  }

  @ApiGetDetailProductSwagger()
  @Get('/:id')
  getDetailProduct(@Param('id') id: string): Promise<IProduct> {
    return this.productService.getDetailProduct(id);
  }

  @authGuard.Roles('ADMIN')
  @ApiUpdateProductSwagger()
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
  @ApiDeleteProductSwagger()
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.productService.deleteProduct(id, admin.username);
  }
}
