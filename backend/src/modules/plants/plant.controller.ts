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
import { IPlant, IPaginatedPlants } from './interfaces/plant.interface';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './DTO/create-plant.dto';
import { GetPlantAllDto } from './DTO/get-plant-all.dto';
import { UpdatePlantDto } from './DTO/update-plant.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiGetPlantsSwagger,
  ApiGetPlantByIdSwagger,
  ApiCreatePlantSwagger,
  ApiUpdatePlantSwagger,
  ApiDeletePlantSwagger,
} from './plant.swagger';

@ApiTags('Nhà máy (Plants)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard)
@Controller('plants')
export class PlantController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly plantService: PlantService) { }

  @authGuard.Public()
  @ApiGetPlantsSwagger()
  @Get()
  @HttpCode(HttpStatus.OK)
  getAll(
    @Query(new ValidationPipe({ transform: true })) query: GetPlantAllDto,
  ): Promise<IPaginatedPlants> {
    return this.plantService.getAll(query);
  }
  @authGuard.Public()
  @ApiGetPlantByIdSwagger()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  getById(@Param('id') id: string): Promise<IPlant> {
    return this.plantService.getById(id);
  }

  @authGuard.Roles('ADMIN')
  @ApiCreatePlantSwagger()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Body(new ValidationPipe({ transform: true })) dto: CreatePlantDto,
  ): Promise<IPlant> {
    return this.plantService.create(dto, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @ApiUpdatePlantSwagger()
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdatePlantDto,
  ): Promise<IPlant> {
    return this.plantService.update(id, dto, admin.username);
  }

  @authGuard.Roles('ADMIN')
  @ApiDeletePlantSwagger()
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @authGuard.CurrentUser() admin: authGuard.JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.plantService.delete(id, admin.username);
  }
}
