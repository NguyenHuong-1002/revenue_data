import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { LandingTestimonialEntity } from '../../../entities/landing-testimonial.entity';

@Controller('landing/testimonials')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Get()
  getTestimonials() {
    return this.testimonialService.getTestimonials();
  }

  @Post()
  createTestimonial(@Body() data: Partial<LandingTestimonialEntity>) {
    return this.testimonialService.createTestimonial(data);
  }

  @Put(':id')
  updateTestimonial(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingTestimonialEntity>,
  ) {
    return this.testimonialService.updateTestimonial(id, data);
  }

  @Delete(':id')
  deleteTestimonial(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.deleteTestimonial(id);
  }
}
