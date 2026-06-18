export class BranchItemDto {
  store_id!: string;
  name!: string;
  city!: string;
  address!: string | null;
  latitude!: number | null;
  longitude!: number | null;
  created_at!: Date;
  updated_at!: Date;
}

export class PaginatedBranchesResponseDto {
  data!: BranchItemDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
