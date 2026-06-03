import api from '@/lib/axios';
import type {
  IBranch,
  IPaginatedBranches,
  CreateBranchDto,
  UpdateBranchDto,
  GetBranchAllDto,
} from '@/lib/types/branch';

export const branchService = {
  list(params?: GetBranchAllDto) {
    return api.get<IPaginatedBranches>('/branches', { params });
  },

  getById(id: string) {
    return api.get<IBranch>(`/branches/${id}`);
  },

  create(data: CreateBranchDto) {
    return api.post<IBranch>('/branches', data);
  },

  update(id: string, data: UpdateBranchDto) {
    return api.patch<IBranch>(`/branches/${id}`, data);
  },

  remove(id: string) {
    return api.delete<void>(`/branches/${id}`);
  },
};

export type BranchService = typeof branchService;
