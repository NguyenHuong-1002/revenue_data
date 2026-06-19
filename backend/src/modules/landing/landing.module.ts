import { Module } from '@nestjs/common';
import { FeatureModule } from './features/feature.module';
import { AiInsightModule } from './ai-insights/ai-insight.module';
import { TestimonialModule } from './testimonials/testimonial.module';

@Module({
  imports: [FeatureModule, AiInsightModule, TestimonialModule],
})
export class LandingModule {}
