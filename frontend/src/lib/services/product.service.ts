import api from '@/lib/axios';
import type {
  IProduct,
  IPaginatedProducts,
  CreateProductDto,
  UpdateProductDto,
  GetProductAllDto,
  IProductStats,
} from '@/lib/types/product';

export const productService = {
  list(params?: GetProductAllDto) {
    return api.get<IPaginatedProducts>('/products', { params });
  },

  getById(id: string) {
    return api.get<IProduct>(`/products/${id}`);
  },

  stats() {
    return api.get<IProductStats>('/products/stats');
  },

  create(data: CreateProductDto) {
    return api.post<IProduct>('/products', data);
  },

  update(id: string, data: UpdateProductDto) {
    return api.put<IProduct>(`/products/${id}`, data);
  },

  remove(id: string) {
    return api.delete<void>(`/products/${id}`);
  },
};

export type ProductService = typeof productService;
