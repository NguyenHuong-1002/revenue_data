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
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { AccountService, avatarMulterOptions } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { GetAccountsAllDto } from './dto/get-accounts-all.dto';
import { LoginAccountDto } from './dto/login-account.dto';
import { SearchAccountsDto } from './dto/search-accounts.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  AccountResponse,
  IAccount,
  ILoginResponse,
  IPaginatedAccounts,
} from './interfaces/account.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterUserDto } from './dto/register-user.dto';

/**
 * Controller quản lý tài khoản người dùng
 * Routes: /accounts
 */
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * [ADMIN] Lấy danh sách tất cả tài khoản (phân trang)
   * GET /accounts?page=1&limit=10
   */
  @authGuard.Roles('ADMIN')
  @Get()
  @HttpCode(HttpStatus.OK)
  getAccounts(
    @Query(new ValidationPipe({ transform: true })) filters: GetAccountsAllDto,
  ): Promise<IPaginatedAccounts> {
    return this.accountService.getUsersAll(filters);
  }

  /**
   * [ADMIN] Tìm kiếm tài khoản theo từ khóa
   * GET /accounts/search?keyword=xxx
   */
  @authGuard.Roles('ADMIN')
  @Get('/search')
  @HttpCode(HttpStatus.OK)
  searchAccounts(
    @Query(new ValidationPipe({ transform: true })) dto: SearchAccountsDto,
  ): Promise<IPaginatedAccounts> {
    return this.accountService.searchAccounts(dto);
  }

  /**
   * [PUBLIC] Lấy thông tin tài khoản đang đăng nhập
   * GET /accounts/me
   */
  @Get('/me')
  @HttpCode(HttpStatus.OK)
  getCurrentAccount(@authGuard.CurrentUser() AdminUser: authGuard.JwtPayload): Promise<IAccount> {
    return this.accountService.getAccountById(AdminUser.sub);
  }

  /**
   * [ADMIN] Lấy thông tin tài khoản theo ID
   * GET /accounts/:id
   */
  @authGuard.Roles('ADMIN')
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getAccountById(@Param('id') id: string): Promise<IAccount> {
    return this.accountService.getAccountById(id);
  }

  /**
   * [ADMIN] Tạo tài khoản mới
   * POST /accounts
   */
  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAccount(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateAccountDto,
  ): Promise<AccountResponse> {
    return this.accountService.createAccount(dto, admin.username);
  }

  /**
   * [PUBLIC] Đăng ký tài khoản mới (Staff)
   * POST /accounts/register
   */
  @authGuard.Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerAccount(
    @Body(new ValidationPipe({ transform: true })) dto: RegisterUserDto,
  ): Promise<void> {
    await this.accountService.register(dto);
  }

  /**
   * [PUBLIC] Đăng nhập
   * POST /accounts/login
   */
  @authGuard.Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  loginAccount(
    @Body(new ValidationPipe({ transform: true })) dto: LoginAccountDto,
  ): Promise<ILoginResponse> {
    return this.accountService.login(dto);
  }

  /**
   * Cập nhật tài khoản (ADMIN sửa bất kỳ, Staff chỉ sửa chính mình)
   * PATCH /accounts/:id
   */
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  updateAccount(
    @authGuard.CurrentUser() currentUser: authGuard.JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateAccountDto,
  ): Promise<IAccount> {
    if (currentUser.role !== 'ADMIN' && currentUser.sub !== id) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa tài khoản của người khác!');
    }
    if (currentUser.role !== 'ADMIN' && dto.role !== undefined) {
      throw new ForbiddenException('Chỉ quản trị viên mới có thể thay đổi vai trò tài khoản!');
    }
    return this.accountService.updateAccount(id, dto, currentUser.username);
  }

  /**
   * [ADMIN] Xóa vĩnh viễn tài khoản
   * DELETE /accounts/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.accountService.deleteAccount(id, admin.username);
  }

  /**
   * [ADMIN] Xóa mềm tài khoản (ẩn khỏi danh sách)
   * DELETE /accounts/:id/soft
   */
  @authGuard.Roles('ADMIN')
  @Delete('/:id/soft')
  @HttpCode(HttpStatus.OK)
  softDeleteAccount(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.accountService.softDeleteAccount(id, admin.username);
  }

  /**
   * Cập nhật ảnh đại diện (Avatar)
   * POST /accounts/avatar
   */
  @Post('/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', avatarMulterOptions))
  async updateAccountAvatar(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên file ảnh đại diện!');
    }
    return this.accountService.updateAvatar(admin.sub, file.filename);
  }
}
