import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryReportDto {
  @IsNotEmpty({ message: 'Mã sản phẩm không được để trống.' })
  @IsString({ message: 'Mã sản phẩm phải là chuỗi ký tự.' })
  product_id!: string;

  @IsNotEmpty({ message: 'Mã nhà máy không được để trống.' })
  @IsString({ message: 'Mã nhà máy phải là chuỗi ký tự.' })
  plant_id!: string;

  @IsNotEmpty({ message: 'Thời gian tuần (calendar_year_week) không được để trống.' })
  @IsString({ message: 'Thời gian tuần phải là chuỗi ký tự ngày tháng (YYYY-MM-DD).' })
  calendar_year_week!: string;

  @IsNotEmpty({ message: 'Số lượng tồn kho không được để trống.' })
  @IsNumber({}, { message: 'Số lượng tồn kho phải là một số.' })
  @Min(0, { message: 'Số lượng tồn kho tối thiểu là 0.' })
  @Type(() => Number)
  quantity!: number;
}
