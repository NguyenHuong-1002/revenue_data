import { IsString, IsNumber, IsEnum, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum DistributionChannel {
  ONLINE = 'Online',
  BAN_LE = 'Bán lẻ',
  PHAT_SINH = 'Phát sinh',
  BAN_SI = 'Bán sỉ',
  SIEU_THI = 'Siêu thị',
  HOP_DONG = 'Hợp đồng',
  CHI_NHANH = 'Chi nhánh',
}

export class CreateSaleReportDto {
  @IsNotEmpty({ message: 'Mã sản phẩm không được để trống.' })
  @IsString({ message: 'Mã sản phẩm phải là chuỗi ký tự.' })
  product_id!: string;

  @IsNotEmpty({ message: 'Mã khách hàng không được để trống.' })
  @IsString({ message: 'Mã khách hàng phải là chuỗi ký tự.' })
  customer_id!: string;

  @IsNotEmpty({ message: 'Số lượng bán không được để trống.' })
  @IsNumber({}, { message: 'Số lượng bán phải là một số.' })
  @Min(0, { message: 'Số lượng bán tối thiểu là 0.' })
  @Type(() => Number)
  sold_quantity!: number;

  @IsNotEmpty({ message: 'Kênh phân phối không được để trống.' })
  @IsEnum(DistributionChannel, { message: 'Kênh phân phối không hợp lệ.' })
  distribution_channel!: 'Online' | 'Bán lẻ' | 'Phát sinh' | 'Bán sỉ' | 'Siêu thị' | 'Hợp đồng' | 'Chi nhánh';

  @IsNotEmpty({ message: 'Mã chi nhánh không được để trống.' })
  @IsString({ message: 'Mã chi nhánh phải là chuỗi ký tự.' })
  branch_id!: string;

  @IsNotEmpty({ message: 'Thời gian báo cáo không được để trống.' })
  @IsString({ message: 'Thời gian báo cáo phải là chuỗi ký tự ngày tháng (YYYY-MM-DD).' })
  time_report!: string;
}
