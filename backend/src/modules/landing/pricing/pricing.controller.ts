import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { LandingPricingEntity } from '../../../entities/landing-pricing.entity';
import {
  ApiGetPricingSwagger,
  ApiCreatePricingSwagger,
  ApiUpdatePricingSwagger,
  ApiDeletePricingSwagger,
} from './pricing.swagger';

@ApiTags('Landing page')
@Controller('landing/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @ApiGetPricingSwagger()
  @Get()
  getPricing() {
    return this.pricingService.getPricing();
  }

  @ApiCreatePricingSwagger()
  @Post()
  createPricing(@Body() data: Partial<LandingPricingEntity>) {
    return this.pricingService.createPricing(data);
  }

  @ApiUpdatePricingSwagger()
  @Put(':id')
  updatePricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingPricingEntity>,
  ) {
    return this.pricingService.updatePricing(id, data);
  }

  @ApiDeletePricingSwagger()
  @Delete(':id')
  deletePricing(@Param('id', ParseIntPipe) id: number) {
    return this.pricingService.deletePricing(id);
  }
}
