import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { AccountService, avatarMulterOptions } from './account.service';
import { CreateAccountDto } from './DTO/create-account.dto';
import { GetAccountsAllDto } from './DTO/getAccountsAll.dto';
import { LoginAccountDto } from './DTO/login-account.dto';
import { SearchAccountsDto } from './DTO/search-accounts.dto';
import { UpdateAccountDto } from './DTO/update-account.dto';
import {
  AccountResponse,
  IAccount,
  ILoginResponse,
  IPaginatedAccounts,
} from './interfaces/account.interface';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiGetUsersAllSwagger,
  ApiGetMeSwagger,
  ApiGetAccountByIdSwagger,
  ApiCreateAccountSwagger,
  ApiRegisterSwagger,
  ApiLoginSwagger,
  ApiUpdateAccountSwagger,
  ApiDeleteAccountSwagger,
  ApiSoftDeleteAccountSwagger,
  ApiSearchAccountsSwagger,
} from './account.swagger';

@ApiTags('Tài khoản (Accounts)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @authGuard.Roles('ADMIN')
  @ApiGetUsersAllSwagger()
  @Get()
  @HttpCode(HttpStatus.OK)
  getUsersAll(
    @Query(new ValidationPipe({ transform: true })) filters: GetAccountsAllDto,
  ): Promise<IPaginatedAccounts> {
    return this.accountService.getUsersAll(filters);
  }

  @ApiGetMeSwagger()
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  getMe(@authGuard.CurrentUser() currentUser: authGuard.JwtPayload): Promise<IAccount> {
    return this.accountService.getAccountById(currentUser.sub);
  }

  @authGuard.Roles('ADMIN')
  @ApiGetAccountByIdSwagger()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getAccountById(@Param('id') id: string): Promise<IAccount> {
    return this.accountService.getAccountById(id);
  }

  @authGuard.Roles('ADMIN')
  @ApiCreateAccountSwagger()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAccount(
    @authGuard.CurrentUser() adminUser: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateAccountDto,
  ): Promise<AccountResponse> {
    return this.accountService.createAccount(dto, adminUser.username);
  }

  @authGuard.Public()
  @ApiRegisterSwagger()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ValidationPipe({ transform: true })) dto: CreateAccountDto,
  ): Promise<void> {
    await this.accountService.register(dto);
  }

  @authGuard.Public()
  @ApiLoginSwagger()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body(new ValidationPipe({ transform: true })) dto: LoginAccountDto,
  ): Promise<ILoginResponse> {
    return this.accountService.login(dto);
  }

  @authGuard.Roles('ADMIN')
  @ApiUpdateAccountSwagger()
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  updateAccount(
    @authGuard.CurrentUser() adminUser: authGuard.JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateAccountDto,
  ): Promise<IAccount> {
    return this.accountService.updateAccount(id, dto, adminUser.username);
  }

  @authGuard.Roles('ADMIN')
  @ApiDeleteAccountSwagger()
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(
    @authGuard.CurrentUser() adminUser: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.accountService.deleteAccount(id, adminUser.username);
  }

  @authGuard.Roles('ADMIN')
  @ApiSoftDeleteAccountSwagger()
  @Delete('/:id/soft')
  @HttpCode(HttpStatus.OK)
  async softDeleteAccount(
    @authGuard.CurrentUser() adminUser: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.accountService.softDeleteAccount(id, adminUser.username);
  }

  @authGuard.Roles('ADMIN')
  @ApiSearchAccountsSwagger()
  @Get('/search')
  @HttpCode(HttpStatus.OK)
  searchAccounts(
    @Query(new ValidationPipe({ transform: true })) dto: SearchAccountsDto,
  ): Promise<IPaginatedAccounts> {
    return this.accountService.searchAccounts(dto);
  }

  @Post('/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', avatarMulterOptions))
  @ApiOperation({ summary: 'Cập nhật ảnh đại diện (Avatar) cho tài khoản hiện tại' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateAvatar(
    @authGuard.CurrentUser() currentUser: authGuard.JwtPayload,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên file ảnh đại diện!');
    }
    return this.accountService.updateAvatar(currentUser.sub, file.filename);
  }
}
