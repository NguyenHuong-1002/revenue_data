export interface IProduct {
  product_id: string;
  color: string;
  listing_price: number;
  price_cost: number;
  gender: string;
  detail_product_group: string;
  size: number;
  age_group: string;
  activity_group: string;
  lifestyle_group: string;
}

export interface IPaginatedProducts {
  data: IProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
