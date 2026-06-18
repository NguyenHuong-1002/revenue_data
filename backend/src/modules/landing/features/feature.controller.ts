import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { FeatureService } from './feature.service';
import { LandingFeatureEntity } from '../../../entities/landing-feature.entity';

@UseGuards(authGuard.AuthGuard)
@Controller('landing/features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @authGuard.Public()
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
