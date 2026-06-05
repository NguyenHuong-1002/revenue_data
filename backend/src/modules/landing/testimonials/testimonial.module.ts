import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialController } from './testimonial.controller';
import { TestimonialService } from './testimonial.service';
import { LandingTestimonialEntity } from '../../../entities/landing-testimonial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LandingTestimonialEntity])],
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}
