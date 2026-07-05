import * as common from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@common.Injectable()
export class ApiLoggerMiddleware implements common.NestMiddleware {
  private readonly context = ApiLoggerMiddleware.name;

  constructor(
    @common.Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: common.LoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const { method, originalUrl: url } = req;
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      const message = `${method} ${url} ${statusCode} ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(message, undefined, this.context);
      } else if (statusCode >= 400) {
        this.logger.warn(message, this.context);
      } else {
        this.logger.log(message, this.context);
      }
    });

    next();
  }
}
