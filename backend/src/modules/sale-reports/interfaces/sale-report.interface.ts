export interface ISaleReport {
  sale_id: string;
  product_id: string;
  sold_quantity: number;
  distribution_channel:
    | 'Online'
    | 'Bán lẻ'
    | 'Phát sinh'
    | 'Bán sỉ'
    | 'Siêu thị'
    | 'Hợp đồng'
    | 'Chi nhánh';
  branch_id: string;
  time_report: string;
  created_at: string;
  updated_at: string;
}

export interface IPaginatedSaleReports {
  data: ISaleReport[];
  meta: {
    skip: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
