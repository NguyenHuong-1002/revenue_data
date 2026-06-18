import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import * as authGuard from 'src/middlewares/auth.guard';
import { InterpretationRequestDto } from './dto/interpretation-request.dto';
import { IInterpretationResponse } from './interfaces/interpretation.interface';
import { AiInterpretationService } from './ai-interpretation.service';

@UseGuards(authGuard.AuthGuard)
@authGuard.Roles('ADMIN')
@Controller('ai/interpretation')
export class AiInterpretationController {
  constructor(private readonly aiInterpretationService: AiInterpretationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  createInterpretation(
    @Body(new ValidationPipe({ transform: true })) dto: InterpretationRequestDto,
  ): Promise<IInterpretationResponse> {
    return this.aiInterpretationService.interpret(dto);
  }
}
