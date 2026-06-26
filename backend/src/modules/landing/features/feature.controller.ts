import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { FeatureService } from './feature.service';
import { LandingFeatureEntity } from './entities/landing-feature.entity';

/**
 * Controller quản lý tính năng Landing Page
 * Routes: /landing/features
 */
@Controller('landing/features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  /**
   * [PUBLIC] Lấy danh sách tính năng
   * GET /landing/features
   */
  @authGuard.Public()
  @Get()
  getFeatures() {
    return this.featureService.getFeatures();
  }

  /**
   * [ADMIN] Tạo tính năng mới
   * POST /landing/features
   */
  @authGuard.Roles('ADMIN')
  @Post()
  createFeature(@Body() data: Partial<LandingFeatureEntity>) {
    return this.featureService.createFeature(data);
  }

  /**
   * [ADMIN] Cập nhật tính năng
   * PUT /landing/features/:id
   */
  @authGuard.Roles('ADMIN')
  @Put(':id')
  updateFeature(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingFeatureEntity>,
  ) {
    return this.featureService.updateFeature(id, data);
  }

  /**
   * [ADMIN] Xóa tính năng
   * DELETE /landing/features/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete(':id')
  deleteFeature(@Param('id', ParseIntPipe) id: number) {
    return this.featureService.deleteFeature(id);
  }
}
