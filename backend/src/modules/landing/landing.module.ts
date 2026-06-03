import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { LandingFeatureEntity } from '../../entities/landing-feature.entity';
import { LandingAiInsightEntity } from '../../entities/landing-ai-insight.entity';
import { LandingTestimonialEntity } from '../../entities/landing-testimonial.entity';
import { LandingPricingEntity } from '../../entities/landing-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LandingFeatureEntity,
      LandingAiInsightEntity,
      LandingTestimonialEntity,
      LandingPricingEntity,
    ]),
  ],
  controllers: [LandingController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
