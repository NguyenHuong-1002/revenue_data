import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { PricingService } from './pricing.service';
import { LandingPricingEntity } from '../../../entities/landing-pricing.entity';

/**
 * Controller quản lý bảng giá Landing Page
 * Routes: /landing/pricing
 */
@UseGuards(authGuard.AuthGuard)
@Controller('landing/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * [PUBLIC] Lấy danh sách bảng giá
   * GET /landing/pricing
   */
  @authGuard.Public()
  @Get()
  getPricing() {
    return this.pricingService.getPricing();
  }

  /**
   * [ADMIN] Tạo bảng giá mới
   * POST /landing/pricing
   */
  @authGuard.Roles('ADMIN')
  @Post()
  createPricing(@Body() data: Partial<LandingPricingEntity>) {
    return this.pricingService.createPricing(data);
  }

  /**
   * [ADMIN] Cập nhật bảng giá
   * PUT /landing/pricing/:id
   */
  @authGuard.Roles('ADMIN')
  @Put(':id')
  updatePricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingPricingEntity>,
  ) {
    return this.pricingService.updatePricing(id, data);
  }

  /**
   * [ADMIN] Xóa bảng giá
   * DELETE /landing/pricing/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete(':id')
  deletePricing(@Param('id', ParseIntPipe) id: number) {
    return this.pricingService.deletePricing(id);
  }
}
