import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiInsightService } from './ai-insight.service';
import { LandingAiInsightEntity } from '../../../entities/landing-ai-insight.entity';
import {
  ApiGetAiInsightsSwagger,
  ApiCreateAiInsightSwagger,
  ApiUpdateAiInsightSwagger,
  ApiDeleteAiInsightSwagger,
} from './ai-insight.swagger';

@ApiTags('Landing page')
@Controller('landing/ai-insights')
export class AiInsightController {
  constructor(private readonly aiInsightService: AiInsightService) {}

  @ApiGetAiInsightsSwagger()
  @Get()
  getAiInsights() {
    return this.aiInsightService.getAiInsights();
  }

  @ApiCreateAiInsightSwagger()
  @Post()
  createAiInsight(@Body() data: Partial<LandingAiInsightEntity>) {
    return this.aiInsightService.createAiInsight(data);
  }

  @ApiUpdateAiInsightSwagger()
  @Put(':id')
  updateAiInsight(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingAiInsightEntity>,
  ) {
    return this.aiInsightService.updateAiInsight(id, data);
  }

  @ApiDeleteAiInsightSwagger()
  @Delete(':id')
  deleteAiInsight(@Param('id', ParseIntPipe) id: number) {
    return this.aiInsightService.deleteAiInsight(id);
  }
}
