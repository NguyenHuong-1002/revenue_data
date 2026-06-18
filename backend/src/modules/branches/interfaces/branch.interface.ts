export interface IBranch {
  store_id: string;
  name: string;
  city: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPaginatedBranches {
  data: IBranch[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
