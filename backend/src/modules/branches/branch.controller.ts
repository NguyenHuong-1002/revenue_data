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
} from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { IBranch, IPaginatedBranches } from './interfaces/branch.interface';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { GetBranchAllDto } from './dto/get-branch-all.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@UseGuards(authGuard.AuthGuard)
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @authGuard.Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  getBranches(
    @Query(new ValidationPipe({ transform: true })) query: GetBranchAllDto,
  ): Promise<IPaginatedBranches> {
    return this.branchService.getAll(query);
  }

  @authGuard.Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getBranchById(@Param('id') id: string): Promise<IBranch> {
    return this.branchService.getById(id);
  }

  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBranch(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateBranchDto,
  ): Promise<IBranch> {
    return this.branchService.create(dto, admin.username);
  }

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
