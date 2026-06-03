import api from '@/lib/axios';
import type {
  IPlant,
  IPaginatedPlants,
  CreatePlantDto,
  UpdatePlantDto,
  GetPlantAllDto,
} from '@/lib/types/plant';

export const plantService = {
  list(params?: GetPlantAllDto) {
    return api.get<IPaginatedPlants>('/plants', { params });
  },

  getById(id: string) {
    return api.get<IPlant>(`/plants/${id}`);
  },

  create(data: CreatePlantDto) {
    return api.post<IPlant>('/plants', data);
  },

  update(id: string, data: UpdatePlantDto) {
    return api.patch<IPlant>(`/plants/${id}`, data);
  },

  remove(id: string) {
    return api.delete<void>(`/plants/${id}`);
  },
};

export type PlantService = typeof plantService;
