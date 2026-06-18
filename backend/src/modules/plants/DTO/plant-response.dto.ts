export class PlantItemDto {
  plant_id!: string;
  name_plant!: string;
  address!: string;
  manager_name!: string;
  phone!: string;
  created_at!: Date;
  updated_at!: Date;
}

export class PaginatedPlantsResponseDto {
  data!: PlantItemDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
