import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiInsightController } from './ai-insight.controller';
import { AiInsightService } from './ai-insight.service';
import { LandingAiInsightEntity } from '../../../entities/landing-ai-insight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LandingAiInsightEntity])],
  controllers: [AiInsightController],
  providers: [AiInsightService],
  exports: [AiInsightService],
})
export class AiInsightModule {}
