export class AccountItemDto {
  account_id!: string;
  role!: 'ADMIN' | 'STAFF';
  fullname!: string;
  username!: string;
  mail!: string;
  avatarURL!: string | null;
  created_at!: Date;
  updated_at!: Date;
}

export class PaginatedAccountsResponseDto {
  data!: AccountItemDto[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class LoginResponseDto {
  message!: string;
  account!: AccountItemDto;
  accessToken!: string;
  tokenType!: string;
}

export class RegisterResponseDto {
  success!: boolean;
  message!: string;
}
