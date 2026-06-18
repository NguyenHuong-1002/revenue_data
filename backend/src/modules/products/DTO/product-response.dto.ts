export class ProductItemDto {
  product_id!: string;
  color!: string;
  listing_price!: number;
  price_cost!: number;
  gender!: 'MEN' | 'WOM' | 'BOY' | 'GIR';
  detail_product_group!: string;
  size!: number;
  age_group!: string;
  activity_group!: string;
  lifestyle_group!: string;
}

export class PaginatedProductsResponseDto {
  data!: ProductItemDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
