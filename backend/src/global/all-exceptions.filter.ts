import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import * as common from '@nestjs/common';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly context = AllExceptionsFilter.name;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: common.LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.getExceptionMessage(exception);
    const logMessage = Array.isArray(message) ? message.join('; ') : message;

    this.logger.error(
      `${request.method} ${request.url} ${statusCode} - ${logMessage}`,
      exception instanceof Error ? exception.stack : undefined,
      this.context,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getExceptionMessage(exception: unknown): string | string[] {
    if (!(exception instanceof HttpException)) {
      return 'Internal Server Error';
    }

    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    return (exceptionResponse as { message?: string | string[] }).message || exception.message;
  }
}
