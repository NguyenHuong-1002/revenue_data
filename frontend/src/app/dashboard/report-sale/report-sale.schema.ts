import { z } from 'zod';

export const createSaleReportSchema = z.object({
  product_id: z.string().min(1, 'Vui lòng nhập/chọn mã sản phẩm'),
  sold_quantity: z.number().min(0, 'Số lượng bán phải lớn hơn hoặc bằng 0'),
  distribution_channel: z.enum(
    ['Online', 'Bán lẻ', 'Phát sinh', 'Bán sỉ', 'Siêu thị', 'Hợp đồng', 'Chi nhánh'],
    {
      message: 'Vui lòng chọn kênh phân phối hợp lệ',
    }
  ),
  branch_id: z.string().min(1, 'Vui lòng nhập/chọn mã chi nhánh'),
  time_report: z.string().min(1, 'Vui lòng chọn thời gian báo cáo'),
});

export type CreateSaleReportFormValues = z.infer<typeof createSaleReportSchema>;
export const editSaleReportSchema = createSaleReportSchema;
export type EditSaleReportFormValues = CreateSaleReportFormValues;
