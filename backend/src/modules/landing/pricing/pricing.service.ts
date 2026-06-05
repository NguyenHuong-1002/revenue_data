import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingPricingEntity } from '../../../entities/landing-pricing.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(LandingPricingEntity)
    private pricingRepo: Repository<LandingPricingEntity>,
  ) {}

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
