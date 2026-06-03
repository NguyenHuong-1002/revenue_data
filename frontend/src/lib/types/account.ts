export interface IAccount {
  account_id: string;
  role: 'ADMIN' | 'STAFF';
  fullname: string;
  username: string;
  mail: string;
  avatarURL?: string | null;
  status_account?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type AccountResponse = Omit<IAccount, 'passwordHash'>;

export interface IPaginatedAccounts {
  data: IAccount[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ILoginResponse {
  message: string;
  account: AccountResponse;
  accessToken: string;
  tokenType: 'Bearer';
}

export interface IRegister {
  fullname: string;
  username: string;
  password: string;
  mail: string;
}

export interface CreateAccountDto {
  fullname: string;
  username: string;
  password: string;
  mail: string;
  avatarURL?: string;
  role?: 'ADMIN' | 'STAFF';
  status_account?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

export interface UpdateAccountDto {
  fullname?: string;
  username?: string;
  password?: string;
  mail?: string;
  avatarURL?: string;
  role?: 'ADMIN' | 'STAFF';
  status_account?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
}

export interface LoginAccountDto {
  username: string;
  password: string;
}

export interface GetAccountsAllDto {
  page?: number;
  limit?: number;
}

export interface SearchAccountsDto {
  keyword?: string;
  role?: 'ADMIN' | 'STAFF';
  status_account?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
