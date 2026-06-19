import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { AiInsightService } from './ai-insight.service';
import { LandingAiInsightEntity } from '../../../entities/landing-ai-insight.entity';

/**
 * Controller quản lý insights AI trên Landing Page
 * Routes: /landing/ai-insights
 */
@UseGuards(authGuard.AuthGuard)
@Controller('landing/ai-insights')
export class AiInsightController {
  constructor(private readonly aiInsightService: AiInsightService) {}

  /**
   * [PUBLIC] Lấy danh sách AI insights
   * GET /landing/ai-insights
   */
  @authGuard.Public()
  @Get()
  getAiInsights() {
    return this.aiInsightService.getAiInsights();
  }

  /**
   * [ADMIN] Tạo AI insight mới
   * POST /landing/ai-insights
   */
  @authGuard.Roles('ADMIN')
  @Post()
  createAiInsight(@Body() data: Partial<LandingAiInsightEntity>) {
    return this.aiInsightService.createAiInsight(data);
  }

  /**
   * [ADMIN] Cập nhật AI insight
   * PUT /landing/ai-insights/:id
   */
  @authGuard.Roles('ADMIN')
  @Put(':id')
  updateAiInsight(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<LandingAiInsightEntity>,
  ) {
    return this.aiInsightService.updateAiInsight(id, data);
  }

  /**
   * [ADMIN] Xóa AI insight
   * DELETE /landing/ai-insights/:id
   */
  @authGuard.Roles('ADMIN')
  @Delete(':id')
  deleteAiInsight(@Param('id', ParseIntPipe) id: number) {
    return this.aiInsightService.deleteAiInsight(id);
  }
}
