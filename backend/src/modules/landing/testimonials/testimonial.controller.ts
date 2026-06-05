import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestimonialService } from './testimonial.service';
import { LandingTestimonialEntity } from '../../../entities/landing-testimonial.entity';
import {
  ApiGetTestimonialsSwagger,
  ApiCreateTestimonialSwagger,
  ApiUpdateTestimonialSwagger,
  ApiDeleteTestimonialSwagger,
} from './testimonial.swagger';

@ApiTags('Landing page')
@Controller('landing/testimonials')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @ApiGetTestimonialsSwagger()
  @Get()
  getTestimonials() {
    return this.testimonialService.getTestimonials();
  }

  @ApiCreateTestimonialSwagger()
  @Post()
  createTestimonial(@Body() data: Partial<LandingTestimonialEntity>) {
    return this.testimonialService.createTestimonial(data);
  }

  @ApiUpdateTestimonialSwagger()
  @Put(':id')
  updateTestimonial(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingTestimonialEntity>,
  ) {
    return this.testimonialService.updateTestimonial(id, data);
  }

  @ApiDeleteTestimonialSwagger()
  @Delete(':id')
  deleteTestimonial(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.deleteTestimonial(id);
  }
}
