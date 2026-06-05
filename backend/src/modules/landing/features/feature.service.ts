import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingFeatureEntity } from '../../../entities/landing-feature.entity';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(LandingFeatureEntity)
    private featureRepo: Repository<LandingFeatureEntity>,
  ) {}

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
}
