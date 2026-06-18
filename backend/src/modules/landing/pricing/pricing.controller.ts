import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { LandingPricingEntity } from '../../../entities/landing-pricing.entity';

@Controller('landing/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  getPricing() {
    return this.pricingService.getPricing();
  }

  @Post()
  createPricing(@Body() data: Partial<LandingPricingEntity>) {
    return this.pricingService.createPricing(data);
  }

  @Put(':id')
  updatePricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingPricingEntity>,
  ) {
    return this.pricingService.updatePricing(id, data);
  }

  @Delete(':id')
  deletePricing(@Param('id', ParseIntPipe) id: number) {
    return this.pricingService.deletePricing(id);
  }
}
