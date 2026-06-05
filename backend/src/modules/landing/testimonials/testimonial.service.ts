import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingTestimonialEntity } from '../../../entities/landing-testimonial.entity';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(LandingTestimonialEntity)
    private testimonialRepo: Repository<LandingTestimonialEntity>,
  ) {}

  async getTestimonials() {
    return this.testimonialRepo.find({ order: { id: 'ASC' } });
  }

  async createTestimonial(data: Partial<LandingTestimonialEntity>) {
    const item = this.testimonialRepo.create(data);
    return this.testimonialRepo.save(item);
  }

  async updateTestimonial(id: number, data: Partial<LandingTestimonialEntity>) {
    const item = await this.testimonialRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Testimonial not found');
    Object.assign(item, data);
    return this.testimonialRepo.save(item);
  }

  async deleteTestimonial(id: number) {
    const item = await this.testimonialRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Testimonial not found');
    return this.testimonialRepo.remove(item);
  }
}
