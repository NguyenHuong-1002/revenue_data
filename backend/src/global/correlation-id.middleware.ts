import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 as uuidv4 } from 'uuid';

export const correlationIdStorage = new AsyncLocalStorage<string>();

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = uuidv4();
    req['correlationId'] = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);
    correlationIdStorage.run(correlationId, next);
  }
}
