export interface IPlant {
  plant_id: string;
  name_plant: string;
  address: string;
  manager_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface IPaginatedPlants {
  data: IPlant[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePlantDto {
  name_plant: string;
  address: string;
  manager_name: string;
  phone: string;
}

export interface UpdatePlantDto {
  name_plant?: string;
  address?: string;
  manager_name?: string;
  phone?: string;
}

export interface GetPlantAllDto {
  page?: number;
  limit?: number;
  address?: string;
  manager_name?: string;
}
