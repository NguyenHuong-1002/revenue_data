import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

type ErrorMessage = string | string[];

type ErrorResponse = {
  statusCode: number;
  message: ErrorMessage;
  path: string;
  method: string;
  timestamp: string;
};

type NestErrorResponse = {
  message?: ErrorMessage;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statusCode = this.getStatusCode(exception);
    const errorResponse: ErrorResponse = {
      statusCode,
      message: this.getMessage(exception),
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      exception instanceof Error ? exception.message : 'Internal server error',
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url} ${statusCode}`,
    );

    response.status(statusCode).json(errorResponse);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): ErrorMessage {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const error = exception.getResponse();

    if (typeof error === 'string') {
      return error;
    }

    if (this.hasMessage(error)) {
      return error.message ?? exception.message;
    }

    return exception.message;
  }

  private hasMessage(value: unknown): value is NestErrorResponse {
    return typeof value === 'object' && value !== null && 'message' in value;
  }
}
