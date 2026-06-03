import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingFeatureEntity } from '../../entities/landing-feature.entity';
import { LandingAiInsightEntity } from '../../entities/landing-ai-insight.entity';
import { LandingTestimonialEntity } from '../../entities/landing-testimonial.entity';
import { LandingPricingEntity } from '../../entities/landing-pricing.entity';

@Injectable()
export class LandingService {
  constructor(
    @InjectRepository(LandingFeatureEntity)
    private featureRepo: Repository<LandingFeatureEntity>,
    @InjectRepository(LandingAiInsightEntity)
    private aiInsightRepo: Repository<LandingAiInsightEntity>,
    @InjectRepository(LandingTestimonialEntity)
    private testimonialRepo: Repository<LandingTestimonialEntity>,
    @InjectRepository(LandingPricingEntity)
    private pricingRepo: Repository<LandingPricingEntity>,
  ) {}

  // Features CRUD
  async getFeatures() {
    return this.featureRepo.find({ order: { id: 'ASC' } });
  }

  async createFeature(data: Partial<LandingFeatureEntity>) {
    const item = this.featureRepo.create(data);
    return this.featureRepo.save(item);
  }

  async updateFeature(id: number, data: Partial<LandingFeatureEntity>) {
    const item = await this.featureRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Feature not found');
    Object.assign(item, data);
    return this.featureRepo.save(item);
  }

  async deleteFeature(id: number) {
    const item = await this.featureRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Feature not found');
    return this.featureRepo.remove(item);
  }

  // AI Insights CRUD
  async getAiInsights() {
    return this.aiInsightRepo.find({ order: { id: 'ASC' } });
  }

  async createAiInsight(data: Partial<LandingAiInsightEntity>) {
    const item = this.aiInsightRepo.create(data);
    return this.aiInsightRepo.save(item);
  }

  async updateAiInsight(id: number, data: Partial<LandingAiInsightEntity>) {
    const item = await this.aiInsightRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('AI Insight not found');
    Object.assign(item, data);
    return this.aiInsightRepo.save(item);
  }

  async deleteAiInsight(id: number) {
    const item = await this.aiInsightRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('AI Insight not found');
    return this.aiInsightRepo.remove(item);
  }

  // Testimonials CRUD
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

  // Pricing CRUD
  async getPricing() {
    return this.pricingRepo.find({ order: { id: 'ASC' } });
  }

  async createPricing(data: Partial<LandingPricingEntity>) {
    const item = this.pricingRepo.create(data);
    return this.pricingRepo.save(item);
  }

  async updatePricing(id: number, data: Partial<LandingPricingEntity>) {
    const item = await this.pricingRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Pricing package not found');
    Object.assign(item, data);
    return this.pricingRepo.save(item);
  }

  async deletePricing(id: number) {
    const item = await this.pricingRepo.findOneBy({ id });
    if (!item) throw new NotFoundException('Pricing package not found');
    return this.pricingRepo.remove(item);
  }
}
