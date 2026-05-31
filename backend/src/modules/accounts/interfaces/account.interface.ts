export interface IAccount {
  account_id: string;
  role: 'ADMIN' | 'STAFF';
  fullname: string;
  username: string;
  passwordHash?: string;
  mail: string;
  avatarURL?: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface IPaginatedAccounts {
  data: IAccount[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type AccountResponse = Omit<IAccount, 'passwordHash'>;

export interface ILoginResponse {
  message: string;
  account: AccountResponse;
  accessToken: string;
  tokenType: 'Bearer';
}

export interface IRegisterResponse {
  success: boolean;
  message: string;
}
