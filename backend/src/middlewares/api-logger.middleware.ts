import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const { method, originalUrl: url } = req;
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const ip = req.ip;
      const correlationId = req['correlationId'];

      const logData = { method, url, statusCode, duration, correlationId, ip };

      if (statusCode >= 500) {
        this.logger.error({ message: `${method} ${url} ${statusCode} ${duration}ms`, ...logData });
      } else if (statusCode >= 400) {
        this.logger.warn({ message: `${method} ${url} ${statusCode} ${duration}ms`, ...logData });
      } else {
        this.logger.log({ message: `${method} ${url} ${statusCode} ${duration}ms`, ...logData });
      }
    });

    next();
  }
}
