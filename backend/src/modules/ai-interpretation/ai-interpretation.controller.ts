// NestJS core decorators: Controller, routing, HTTP status, validation
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
// Swagger decorators: API documentation & test UI
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// Custom auth guard & role-based access control
import * as authGuard from 'src/middlewares/auth.guard';
// DTO: defines the shape & validation rules of the incoming request body
import { InterpretationRequestDto } from './DTO/interpretation-request.dto';
// Interface: typed response from the AI interpretation
import { IInterpretationResponse } from './interfaces/interpretation.interface';
// Service layer: contains the actual business logic
import { AiInterpretationService } from './ai-interpretation.service';
// Swagger decorator functions: detailed API documentation for each endpoint
import { ApiInterpretSwagger } from './ai-interpretation.swagger';

// ─── Controller Metadata ──────────────────────────────────────────────────────
@ApiTags('Dien giai AI (DeepSeek)')
@ApiBearerAuth()
@UseGuards(authGuard.AuthGuard) // Kiểm tra JWT token trước khi vào handler
@authGuard.Roles('ADMIN') // Chỉ tài khoản có role ADMIN mới được gọi
@Controller('ai/interpretation') // Base path: /ai/interpretation
export class AiInterpretationController {
  // Inject service qua constructor (private readonly → chỉ dùng nội bộ, không gán lại)
  constructor(private readonly aiInterpretationService: AiInterpretationService) {}

  // ─── POST /ai/interpretation ──────────────────────────────────────────────
  @ApiInterpretSwagger()
  @Post()
  @HttpCode(HttpStatus.OK)
  interpret(
    // ValidationPipe: tự động validate & transform DTO dựa trên decorators class-validator
    @Body(new ValidationPipe({ transform: true })) dto: InterpretationRequestDto,
  ): Promise<IInterpretationResponse> {
    // Delegate to service — controller chỉ làm nhiệm vụ điều phối (thin controller)
    return this.aiInterpretationService.interpret(dto);
  }
}
