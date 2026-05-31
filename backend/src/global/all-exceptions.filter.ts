import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

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
  private readonly logDir = join(process.cwd(), 'logs');
  private readonly logFile = join(this.logDir, 'error.log');

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

    this.writeLog(exception, errorResponse);
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

  private writeLog(exception: unknown, errorResponse: ErrorResponse) {
    this.createLogDir();

    const logMessage = [
      `[${errorResponse.timestamp}] ${errorResponse.method} ${errorResponse.path}`,
      `Status: ${errorResponse.statusCode}`,
      `Message: ${this.formatMessage(errorResponse.message)}`,
      `Stack: ${this.getStack(exception)}`,
      '',
    ].join('\n');

    appendFileSync(this.logFile, logMessage);
  }

  private createLogDir() {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(message: ErrorMessage): string {
    return Array.isArray(message) ? message.join(', ') : message;
  }

  private getStack(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.stack ?? exception.message;
    }

    return JSON.stringify(exception, null, 2);
  }
}
