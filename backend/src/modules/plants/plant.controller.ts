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
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { IPlant, IPaginatedPlants } from './interfaces/plant.interface';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { GetPlantAllDto } from './dto/get-plant-all.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

/**
 * Controller quản lý nhà máy (Plant)
 * Routes: /plants
 */
@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  /**
   * [PUBLIC] Lấy danh sách nhà máy (phân trang, lọc theo tên/thành phố)
   * GET /plants?page=1&limit=10&name=xxx
   */
  @authGuard.Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  getPlants(
    @Query(new ValidationPipe({ transform: true })) query: GetPlantAllDto,
  ): Promise<IPaginatedPlants> {
    return this.plantService.getAll(query);
  }

  /**
   * [PUBLIC] Lấy chi tiết nhà máy theo ID
   * GET /plants/:id
   */
  @authGuard.Public()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getPlantById(@Param('id') id: string): Promise<IPlant> {
    return this.plantService.getById(id);
  }

  /**
   * [ADMIN] Tạo nhà máy mới
   * POST /plants
   */
  @authGuard.Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPlant(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreatePlantDto,
  ): Promise<IPlant> {
    return this.plantService.create(dto, admin.username);
  }

  /**
   * [ADMIN] Cập nhật nhà máy
   * PATCH /plants/:id
   */
  @authGuard.Roles('ADMIN')
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  updatePlant(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePlantDto,
  ): Promise<IPlant> {
    return this.plantService.update(id, dto, admin.username);
  }

  /**
   * [ADMIN] Xóa nhà máy
   * DELETE /plants/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePlant(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.plantService.delete(id, admin.username);
  }
}
