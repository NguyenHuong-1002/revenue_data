import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import * as authGuard from 'src/guards/auth.guard';
import { InterpretationRequestDto } from './dto/interpretation-request.dto';
import { IInterpretationResponse } from './interfaces/interpretation.interface';
import { AiInterpretationService } from './ai-interpretation.service';

/**
 * Controller phân tích dữ liệu bằng AI
 * Routes: /ai/interpretation
 */
@authGuard.Roles('ADMIN')
@Controller('ai/interpretation')
export class AiInterpretationController {
  constructor(private readonly aiInterpretationService: AiInterpretationService) {}

  /**
   * [ADMIN] Phân tích dữ liệu theo query
   * POST /ai/interpretation
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  createInterpretation(
    @Body(new ValidationPipe({ transform: true })) dto: InterpretationRequestDto,
  ): Promise<IInterpretationResponse> {
    return this.aiInterpretationService.interpret(dto);
  }
}
