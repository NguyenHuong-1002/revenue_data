import { z } from 'zod';

export const createProductSchema = z.object({
  color: z.string().min(1, 'Vui lòng nhập màu sắc'),
  listing_price: z.number().min(0, 'Giá bán phải lớn hơn hoặc bằng 0'),
  price_cost: z.number().min(0, 'Giá vốn phải lớn hơn hoặc bằng 0'),
  gender: z.string().min(1, 'Vui lòng chọn giới tính'),
  detail_product_group: z.string().min(1, 'Vui lòng chọn nhóm chi tiết sản phẩm'),
  size: z.number().min(1, 'Kích cỡ phải lớn hơn hoặc bằng 1'),
  age_group: z.string().min(1, 'Vui lòng chọn nhóm độ tuổi'),
  activity_group: z.string().min(1, 'Vui lòng chọn nhóm hoạt động'),
  lifestyle_group: z.string().min(1, 'Vui lòng chọn nhóm phong cách sống'),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;

export const editProductSchema = createProductSchema;
export type EditProductFormValues = CreateProductFormValues;
