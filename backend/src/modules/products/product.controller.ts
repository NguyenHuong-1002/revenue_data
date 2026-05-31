import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { AuthGuard, Roles, CurrentUser } from 'src/middlewares/auth.guard';
import type { JwtPayload } from 'src/middlewares/auth.guard';
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
@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @ApiGetProductsSwagger()
  @Get()
  getProductsController(
    @Query(new ValidationPipe({ transform: true })) query: GetProductAllDto,
  ): Promise<IPaginatedProducts> {
    return this.productService.getProductsAll(query);
  }

  @Roles('ADMIN')
  @ApiPostProductSwagger()
  @Post()
  postProduct(
    @CurrentUser() user: any,
    @Body(new ValidationPipe({ transform: true })) productDTO: CreateProductDto,
  ): Promise<IProduct> {
    return this.productService.createProduct(productDTO, user.username);
  }

  @ApiGetDetailProductSwagger()
  @Get('/:id')
  getDetailProduct(@Param('id') id: string): Promise<IProduct> {
    return this.productService.getDetailProduct(id);
  }

  @Roles('ADMIN')
  @ApiUpdateProductSwagger()
  @Put('/:id')
  updateProduct(
    @CurrentUser() user: any,
    @Body(new ValidationPipe({ transform: true })) productDTO: CreateProductDto,
    @Param('id') id: string,
  ): Promise<IProduct> {
    return this.productService.updateProduct(productDTO, id, user.username);
  }

  @Roles('ADMIN')
  @ApiDeleteProductSwagger()
  @Delete('/:id')
  deleteProduct(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<boolean> {
    return this.productService.deleteProduct(id, user.username);
  }
}
