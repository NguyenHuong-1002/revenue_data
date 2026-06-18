import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { LandingFeatureEntity } from '../../../entities/landing-feature.entity';

@Controller('landing/features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  getFeatures() {
    return this.featureService.getFeatures();
  }

  @Post()
  createFeature(@Body() data: Partial<LandingFeatureEntity>) {
    return this.featureService.createFeature(data);
  }

  @Put(':id')
  updateFeature(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingFeatureEntity>,
  ) {
    return this.featureService.updateFeature(id, data);
  }

  @Delete(':id')
  deleteFeature(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.deleteFeature(id);
  }
}
