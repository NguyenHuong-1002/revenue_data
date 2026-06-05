export interface IBranch {
  store_id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
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
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateBranchDto {
  name?: string;
  city?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface GetBranchAllDto {
  page?: number;
  limit?: number;
  city?: string;
}
