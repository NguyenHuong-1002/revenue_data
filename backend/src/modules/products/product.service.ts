import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ProductDTO } from "src/dto/product.dto";
import { Product } from "src/models/product.model";


@Injectable()
export class ProductService {

  private products: Product[] = [
    { id: 1, categoryId: 2, price: 80000, productName: 'Keyboard' }, {
      id: 2, categoryId: 2, price: 90000, productName: 'Nine dev'
    }
  ]
  getProducts(): Product[] {
    return this.products;
  }

  creatProducts(productDTO: ProductDTO): Product {
    const product: Product = {
      id: Math.random(),
      ...productDTO
    }
    this.products.push(product);
    return product;
  }

  getDetailProduct(id: number): Product {
    this.validateId(id);

    const product = this.products.find(item => item.id === id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  updateProduct(productDTO: ProductDTO, id: number): Product {
    this.validateId(id);

    const index = this.products.findIndex(item => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Product not found');
    }

    this.products[index].categoryId = productDTO.categoryId;
    this.products[index].price = productDTO.price;
    this.products[index].productName = productDTO.productName;
    return this.products[index];
  }

  deleteProduct(id: number): boolean {
    this.validateId(id);

    const index = this.products.findIndex(item => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Product not found');
    }

    this.products.splice(index, 1);
    return true;
  }

  private validateId(id: number) {
    if (Number.isNaN(id)) {
      throw new BadRequestException('Product id must be a number');
    }
  }
};
