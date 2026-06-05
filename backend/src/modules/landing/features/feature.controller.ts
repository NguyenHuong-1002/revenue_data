import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { LandingFeatureEntity } from '../../../entities/landing-feature.entity';
import {
  ApiGetFeaturesSwagger,
  ApiCreateFeatureSwagger,
  ApiUpdateFeatureSwagger,
  ApiDeleteFeatureSwagger,
} from './feature.swagger';

@ApiTags('Landing page')
@Controller('landing/features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @ApiGetFeaturesSwagger()
  @Get()
  getFeatures() {
    return this.featureService.getFeatures();
  }

  @ApiCreateFeatureSwagger()
  @Post()
  createFeature(@Body() data: Partial<LandingFeatureEntity>) {
    return this.featureService.createFeature(data);
  }

  @ApiUpdateFeatureSwagger()
  @Put(':id')
  updateFeature(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingFeatureEntity>,
  ) {
    return this.featureService.updateFeature(id, data);
  }

  @ApiDeleteFeatureSwagger()
  @Delete(':id')
  deleteFeature(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.deleteFeature(id);
  }
}
