export interface IBranch {
  store_id: string;
  name: string;
  city: string;
  created_at: string;
  updated_at: string;
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

export interface CreateBranchDto {
  name: string;
  city: string;
}

export interface UpdateBranchDto {
  name?: string;
  city?: string;
}

export interface GetBranchAllDto {
  page?: number;
  limit?: number;
  city?: string;
}
