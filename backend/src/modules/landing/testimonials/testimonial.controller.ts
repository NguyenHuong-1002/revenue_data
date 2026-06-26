import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { TestimonialService } from './testimonial.service';
import { LandingTestimonialEntity } from './entities/landing-testimonial.entity';

/**
 * Controller quản lý đánh giá khách hàng Landing Page
 * Routes: /landing/testimonials
 */
@Controller('landing/testimonials')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  /**
   * [PUBLIC] Lấy danh sách đánh giá
   * GET /landing/testimonials
   */
  @authGuard.Public()
  @Get()
  getTestimonials() {
    return this.testimonialService.getTestimonials();
  }

  /**
   * [ADMIN] Tạo đánh giá mới
   * POST /landing/testimonials
   */
  @authGuard.Roles('ADMIN')
  @Post()
  createTestimonial(@Body() data: Partial<LandingTestimonialEntity>) {
    return this.testimonialService.createTestimonial(data);
  }

  /**
   * [ADMIN] Cập nhật đánh giá
   * PUT /landing/testimonials/:id
   */
  @authGuard.Roles('ADMIN')
  @Put(':id')
  updateTestimonial(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingTestimonialEntity>,
  ) {
    return this.testimonialService.updateTestimonial(id, data);
  }

  /**
   * [ADMIN] Xóa đánh giá
   * DELETE /landing/testimonials/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete(':id')
  deleteTestimonial(@Param('id', ParseIntPipe) id: number) {
    return this.testimonialService.deleteTestimonial(id);
  }
}
