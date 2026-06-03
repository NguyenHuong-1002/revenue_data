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
import { CreateBranchDto } from './DTO/create-branch.dto';
import { GetBranchAllDto } from './DTO/get-branch-all.dto';
import { UpdateBranchDto } from './DTO/update-branch.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiGetBranchesSwagger,
  ApiGetBranchByIdSwagger,
  ApiCreateBranchSwagger,
  ApiUpdateBranchSwagger,
  ApiDeleteBranchSwagger,
} from './branch.swagger';

@ApiTags('Chi nhánh (Branches)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@Controller('branches')
export class BranchController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly branchService: BranchService) {}

  @authGuard.Public()
  @ApiGetBranchesSwagger()
  @Get()
  @HttpCode(HttpStatus.OK)
  getAll(
    @Query(new ValidationPipe({ transform: true })) query: GetBranchAllDto,
  ): Promise<IPaginatedBranches> {
    return this.branchService.getAll(query);
  }

  @authGuard.Public()
  @ApiGetBranchByIdSwagger()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getById(@Param('id') id: string): Promise<IBranch> {
    return this.branchService.getById(id);
  }

  @authGuard.Roles('ADMIN')
  @ApiCreateBranchSwagger()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateBranchDto,
  ): Promise<IBranch> {
    return this.branchService.create(dto, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @ApiUpdateBranchSwagger()
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateBranchDto,
  ): Promise<IBranch> {
    return this.branchService.update(id, dto, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @ApiDeleteBranchSwagger()
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.branchService.delete(id, admin.username);
  }
}
