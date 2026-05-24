import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from 'src/models/product.model';
import { ProductDTO } from 'src/dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get()
  getProducts(): Product[] {
    return this.productService.getProducts();
  }

  @Post()
  postProduct(@Body(new ValidationPipe()) productDTO: ProductDTO): Product {
    return this.productService.creatProducts(productDTO);
  }

  @Get('/:id')
  getDetailProduct(@Param('id') id: string): Product {
    return this.productService.getDetailProduct(Number(id));
  }

  @Put('/:id')
  updateProduct(
    @Body() productDTO: ProductDTO,
    @Param('id') id: string,
  ): Product {
    return this.productService.updateProduct(productDTO, Number(id));
  }

  @Delete('/:id')
  deleteProduct(@Param('id') id: string): boolean {
    return this.productService.deleteProduct(Number(id));
  }
}
