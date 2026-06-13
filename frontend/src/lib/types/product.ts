export interface IProduct {
  product_id: string;
  color: string;
  listing_price: number;
  price_cost: number;
  gender: 'MEN' | 'WOM' | 'BOY' | 'GIR';
  detail_product_group:
    | 'SANTD'
    | 'DEPTD'
    | 'GTTPC'
    | 'GTTCD'
    | 'SANTR'
    | 'GIATR'
    | 'PKIEN'
    | 'TBLTH'
    | 'TBLTR';
  size: number;
  age_group:
    | '16 đến <24 tuổi'
    | '24 đến <40 tuổi'
    | '40 đến <60 tuổi'
    | '0 đến <3 tuổi'
    | 'Trên 60 tuổi'
    | '6 đến <10 tuổi'
    | '3 đến <6 tuổi'
    | '10 đến <16 tuổi'
    | 'Khác';
  activity_group: 'Thường nhật/Trường học' | 'Thể thao' | 'Văn phòng' | 'Chuyên biệt' | 'Khác';
  lifestyle_group: 'Sport' | 'Casual' | 'Fashion' | 'Formal' | 'Khác';
  created_at?: string;
  updated_at?: string;
}

export interface IPaginatedProducts {
  data: IProduct[];
  meta: {
    skip: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductDto {
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

export type UpdateProductDto = Partial<CreateProductDto>;

export interface GetProductAllDto {
  skip?: number;
  limit?: number;
  product_id?: string;
  color?: string;
  listing_price?: number;
  price_cost?: number;
  gender?: string;
  detail_product_group?: string;
  size?: number;
  age_group?: string;
  activity_group?: string;
  lifestyle_group?: string;
}

export interface IProductStats {
  gender: { name: string; count: number }[];
  age_group: { name: string; count: number }[];
  activity_group: { name: string; count: number }[];
  lifestyle_group: { name: string; count: number }[];
}
