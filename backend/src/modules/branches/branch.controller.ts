import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard, Roles, CurrentUser } from 'src/middlewares/auth.guard';
import type { JwtPayload } from 'src/middlewares/auth.guard';
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
@UseGuards(AuthGuard)
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @ApiGetBranchesSwagger()
  @Get()
  @HttpCode(HttpStatus.OK)
  getAll(@Query(new ValidationPipe({ transform: true })) query: GetBranchAllDto): Promise<IPaginatedBranches> {
    return this.branchService.getAll(query);
  }

  @ApiGetBranchByIdSwagger()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getById(@Param('id') id: string): Promise<IBranch> {
    return this.branchService.getById(id);
  }

  @Roles('ADMIN')
  @ApiCreateBranchSwagger()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreateBranchDto,
  ): Promise<IBranch> {
    return this.branchService.create(dto, user.username);
  }

  @Roles('ADMIN')
  @ApiUpdateBranchSwagger()
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateBranchDto,
  ): Promise<IBranch> {
    return this.branchService.update(id, dto, user.username);
  }

  @Roles('ADMIN')
  @ApiDeleteBranchSwagger()
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<boolean> {
    return this.branchService.delete(id, user.username);
  }
}
