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
} from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { IBranch } from './interfaces/branch.interface';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { GetBranchAllDto } from './dto/get-branch-all.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PaginatedResponseDto } from '@/common/dto/paginated-response.dto';

/**
 * Controller quản lý chi nhánh
 * Routes: /branches
 */
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  /**
   * [PUBLIC] Lấy danh sách chi nhánh (phân trang, lọc theo thành phố)
   * GET /branches?page=1&limit=10&city=xxx
   */
  @authGuard.Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  getBranches(
    @Query(new ValidationPipe({ transform: true })) query: GetBranchAllDto,
  ): Promise<PaginatedResponseDto<IBranch>> {
    return this.branchService.getAll(query);
  }

  /**
   * [PUBLIC] Lấy chi tiết chi nhánh theo ID
   * GET /branches/:id
   */
  @authGuard.Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getBranchById(@Param('id') id: string): Promise<IBranch> {
    return this.branchService.getById(id);
  }

  /**
   * [ADMIN] Tạo chi nhánh mới
   * POST /branches
   */
  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBranch(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateBranchDto,
  ): Promise<IBranch> {
    return this.branchService.create(dto, admin.username);
  }

  /**
   * [ADMIN] Cập nhật chi nhánh
   * PATCH /branches/:id
   */
  @authGuard.Roles('ADMIN')
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  updateBranch(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateBranchDto,
  ): Promise<IBranch> {
    return this.branchService.update(id, dto, admin.username);
  }

  /**
   * [ADMIN] Xóa chi nhánh
   * DELETE /branches/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBranch(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.branchService.delete(id, admin.username);
  }
}
