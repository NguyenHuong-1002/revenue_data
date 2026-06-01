import { Module } from '@nestjs/common';
import { AiInterpretationController } from './ai-interpretation.controller';
import { AiInterpretationService } from './ai-interpretation.service';

@Module({
  controllers: [AiInterpretationController],
  providers: [AiInterpretationService],
})
export class AiInterpretationModule {}

