import { z } from 'zod';

export const createInventoryReportSchema = z.object({
  product_id: z.string().min(1, 'Vui lòng nhập/chọn mã sản phẩm'),
  plant_id: z.string().min(1, 'Vui lòng nhập/chọn mã nhà máy'),
  calendar_year_week: z.string().min(1, 'Vui lòng chọn thời gian tuần'),
  quantity: z.number().min(0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'),
});

export type CreateInventoryReportFormValues = z.infer<typeof createInventoryReportSchema>;
export const editInventoryReportSchema = createInventoryReportSchema;
export type EditInventoryReportFormValues = CreateInventoryReportFormValues;
