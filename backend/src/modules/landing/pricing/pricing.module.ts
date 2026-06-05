import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { LandingPricingEntity } from '../../../entities/landing-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LandingPricingEntity])],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
