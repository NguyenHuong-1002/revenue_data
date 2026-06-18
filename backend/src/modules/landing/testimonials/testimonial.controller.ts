import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { TestimonialService } from './testimonial.service';
import { LandingTestimonialEntity } from '../../../entities/landing-testimonial.entity';

@UseGuards(authGuard.AuthGuard)
@Controller('landing/testimonials')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @authGuard.Public()
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
