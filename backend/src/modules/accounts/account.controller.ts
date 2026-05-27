import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { AccountService } from './account.service';
import { CreateAccountDto } from './DTO/create-account.dto';
import { GetAccountsAllDto } from './DTO/getAccountsAll.dto';
import { LoginAccountDto } from './DTO/login-account.dto';
import { UpdateAccountDto } from './DTO/update-account.dto';
import {
  AccountResponse,
  IAccount,
  ILoginResponse,
  IPaginatedAccounts,
  IRegisterResponse,
} from './interfaces/account.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiGetUsersAllSwagger,
  ApiGetAccountByIdSwagger,
} from './account.swagger';

@ApiTags('Tài khoản (Accounts)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@Controller('accounts')
export class AccountController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly accountService: AccountService) { }

  // @authGuard.Roles('ADMIN')
  @authGuard.Public()
  @ApiGetUsersAllSwagger()
  @Get()
  getUsersAll(
    @Query(new ValidationPipe({ transform: true })) filters: GetAccountsAllDto,
  ): Promise<IPaginatedAccounts> {
    return this.accountService.getUsersAll(filters);
  }

  // @authGuard.Roles('ADMIN')
  @authGuard.Public()
  @ApiGetAccountByIdSwagger()
  @Get('/:id')
  getAccountById(@Param('id') id: string): Promise<IAccount> {
    return this.accountService.getAccountById(id);
  }

  @authGuard.Roles('ADMIN')
  @Post()
  createAccount(
    @authGuard.CurrentUser() adminUser: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateAccountDto,
  ): Promise<AccountResponse> {
    return this.accountService.createAccount(dto, adminUser.username);
  }

  @authGuard.Public()
  @Post('/register')
  register(
    @Body(new ValidationPipe({ transform: true })) dto: CreateAccountDto,
  ): Promise<IRegisterResponse> {
    return this.accountService.register(dto);
  }

  @authGuard.Public()
  @Post('/login')
  login(
    @Body(new ValidationPipe({ transform: true })) dto: LoginAccountDto,
  ): Promise<ILoginResponse> {
    return this.accountService.login(dto);
  }

  @authGuard.Roles('ADMIN')
  @Patch('/:id')
  updateAccount(
    @authGuard.CurrentUser() adminUser: authGuard.JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateAccountDto,
  ): Promise<IAccount> {
    return this.accountService.updateAccount(id, dto, adminUser.username);
  }

  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  deleteAccount(
    @authGuard.CurrentUser() adminUser: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.accountService.deleteAccount(id, adminUser.username);
  }
}
