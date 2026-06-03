import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LandingService } from './landing.service';
import { LandingFeatureEntity } from '../../entities/landing-feature.entity';
import { LandingAiInsightEntity } from '../../entities/landing-ai-insight.entity';
import { LandingTestimonialEntity } from '../../entities/landing-testimonial.entity';
import { LandingPricingEntity } from '../../entities/landing-pricing.entity';
import {
  ApiGetFeaturesSwagger,
  ApiCreateFeatureSwagger,
  ApiUpdateFeatureSwagger,
  ApiDeleteFeatureSwagger,
  ApiGetAiInsightsSwagger,
  ApiCreateAiInsightSwagger,
  ApiUpdateAiInsightSwagger,
  ApiDeleteAiInsightSwagger,
  ApiGetTestimonialsSwagger,
  ApiCreateTestimonialSwagger,
  ApiUpdateTestimonialSwagger,
  ApiDeleteTestimonialSwagger,
  ApiGetPricingSwagger,
  ApiCreatePricingSwagger,
  ApiUpdatePricingSwagger,
  ApiDeletePricingSwagger,
} from './landing.swagger';

@ApiTags('Landing page')
@Controller('landing')
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  // Features
  @ApiGetFeaturesSwagger()
  @Get('features')
  getFeatures() {
    return this.landingService.getFeatures();
  }

  @ApiCreateFeatureSwagger()
  @Post('features')
  createFeature(@Body() data: Partial<LandingFeatureEntity>) {
    return this.landingService.createFeature(data);
  }

  @ApiUpdateFeatureSwagger()
  @Put('features/:id')
  updateFeature(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingFeatureEntity>,
  ) {
    return this.landingService.updateFeature(id, data);
  }

  @ApiDeleteFeatureSwagger()
  @Delete('features/:id')
  deleteFeature(@Param('id', ParseIntPipe) id: number) {
    return this.landingService.deleteFeature(id);
  }

  // AI Insights
  @ApiGetAiInsightsSwagger()
  @Get('ai-insights')
  getAiInsights() {
    return this.landingService.getAiInsights();
  }

  @ApiCreateAiInsightSwagger()
  @Post('ai-insights')
  createAiInsight(@Body() data: Partial<LandingAiInsightEntity>) {
    return this.landingService.createAiInsight(data);
  }

  @ApiUpdateAiInsightSwagger()
  @Put('ai-insights/:id')
  updateAiInsight(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingAiInsightEntity>,
  ) {
    return this.landingService.updateAiInsight(id, data);
  }

  @ApiDeleteAiInsightSwagger()
  @Delete('ai-insights/:id')
  deleteAiInsight(@Param('id', ParseIntPipe) id: number) {
    return this.landingService.deleteAiInsight(id);
  }

  // Testimonials
  @ApiGetTestimonialsSwagger()
  @Get('testimonials')
  getTestimonials() {
    return this.landingService.getTestimonials();
  }

  @ApiCreateTestimonialSwagger()
  @Post('testimonials')
  createTestimonial(@Body() data: Partial<LandingTestimonialEntity>) {
    return this.landingService.createTestimonial(data);
  }

  @ApiUpdateTestimonialSwagger()
  @Put('testimonials/:id')
  updateTestimonial(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingTestimonialEntity>,
  ) {
    return this.landingService.updateTestimonial(id, data);
  }

  @ApiDeleteTestimonialSwagger()
  @Delete('testimonials/:id')
  deleteTestimonial(@Param('id', ParseIntPipe) id: number) {
    return this.landingService.deleteTestimonial(id);
  }

  // Pricing
  @ApiGetPricingSwagger()
  @Get('pricing')
  getPricing() {
    return this.landingService.getPricing();
  }

  @ApiCreatePricingSwagger()
  @Post('pricing')
  createPricing(@Body() data: Partial<LandingPricingEntity>) {
    return this.landingService.createPricing(data);
  }

  @ApiUpdatePricingSwagger()
  @Put('pricing/:id')
  updatePricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingPricingEntity>,
  ) {
    return this.landingService.updatePricing(id, data);
  }

  @ApiDeletePricingSwagger()
  @Delete('pricing/:id')
  deletePricing(@Param('id', ParseIntPipe) id: number) {
    return this.landingService.deletePricing(id);
  }
}
