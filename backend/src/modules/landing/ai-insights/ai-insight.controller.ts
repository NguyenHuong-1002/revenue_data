import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AiInsightService } from './ai-insight.service';
import { LandingAiInsightEntity } from '../../../entities/landing-ai-insight.entity';

@Controller('landing/ai-insights')
export class AiInsightController {
  constructor(private readonly aiInsightService: AiInsightService) {}

  @Get()
  getAiInsights() {
    return this.aiInsightService.getAiInsights();
  }

  @Post()
  createAiInsight(@Body() data: Partial<LandingAiInsightEntity>) {
    return this.aiInsightService.createAiInsight(data);
  }

  @Put(':id')
  updateAiInsight(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingAiInsightEntity>,
  ) {
    return this.aiInsightService.updateAiInsight(id, data);
  }

  @Delete(':id')
  deleteAiInsight(@Param('id', ParseIntPipe) id: number) {
    return this.aiInsightService.deleteAiInsight(id);
  }
}
