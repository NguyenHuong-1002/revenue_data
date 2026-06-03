import api from '@/lib/axios';
import type {
  IAccount,
  AccountResponse,
  IPaginatedAccounts,
  ILoginResponse,
  IRegister,
  CreateAccountDto,
  UpdateAccountDto,
  LoginAccountDto,
  GetAccountsAllDto,
  SearchAccountsDto,
} from '@/lib/types/account';

export const accountService = {
  list(params?: GetAccountsAllDto) {
    return api.get<IPaginatedAccounts>('/accounts', { params });
  },

  search(params?: SearchAccountsDto) {
    return api.get<IPaginatedAccounts>('/accounts/search', { params });
  },

  me() {
    return api.get<AccountResponse>('/accounts/me');
  },

  getById(id: string) {
    return api.get<IAccount>(`/accounts/${id}`);
  },

  create(data: CreateAccountDto) {
    return api.post<AccountResponse>('/accounts', data);
  },

  register(data: IRegister) {
    return api.post<void>('/accounts/register', data);
  },

  login(data: LoginAccountDto) {
    return api.post<ILoginResponse>('/accounts/login', data);
  },

  update(id: string, data: UpdateAccountDto) {
    return api.patch<IAccount>(`/accounts/${id}`, data);
  },

  remove(id: string) {
    return api.delete<void>(`/accounts/${id}`);
  },

  softRemove(id: string) {
    return api.delete<void>(`/accounts/${id}/soft`);
  },

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; message: string; avatarURL: string }>(
      '/accounts/avatar',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },
};

export type AccountService = typeof accountService;
