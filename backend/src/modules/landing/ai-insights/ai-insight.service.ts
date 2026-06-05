import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingAiInsightEntity } from '../../../entities/landing-ai-insight.entity';

@Injectable()
export class AiInsightService {
  constructor(
    @InjectRepository(LandingAiInsightEntity)
    private aiInsightRepo: Repository<LandingAiInsightEntity>,
  ) {}

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
}
