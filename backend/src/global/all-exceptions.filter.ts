import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { existsSync, mkdirSync, appendFileSync } from 'node:fs'; // existsSync() kiểm tra thư mục tồn tại hay không // mkdirSync kiểm tra thư mục  // appendFileSync  ghi nội dung vào thư mục
import { join } from 'node:path'; // đường dẫn
import type { Request, Response } from 'express'; // import kiểu dữ liệu 

// bắt tất cả exception trong ứng dụng 
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logDir = join(process.cwd(), 'logs'); // bắt về đường dẫn folder logs
  private readonly logFile = join(this.logDir, 'error.log'); // đường dẫn file error.log

  catch(exception: unknown, host: ArgumentsHost) { // exception : chứa lỗi xảy ra , host : chứa request/response/context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR; // lấy ra trạng thái

    const message = this.getErrorMessage(exception); // lấy ra lỗi ngoại lệ đã định nghĩa bên dưới

    const errorResponse = { // định nghĩa đầu ra của lỗi
      statusCode: status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    this.writeLog(exception, errorResponse); // ghi vào file logs 

    response.status(status).json(errorResponse);
  }

  private writeLog(exception: unknown, errorResponse: Record<string, unknown>) {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    } // kiểm tra xem tồn tại chưa

    const stack =
      exception instanceof Error
        ? exception.stack
        : JSON.stringify(exception, null, 2);

    const logMessage = [
      `[${errorResponse.timestamp}] ${errorResponse.method} ${errorResponse.path}`,
      `Status: ${errorResponse.statusCode}`,
      `Message: ${errorResponse.message}`,
      `Stack: ${stack}`,
      '',
    ].join('\n');

    appendFileSync(this.logFile, logMessage); // ghi vào file
  }

  private getErrorMessage(exception: unknown) {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      return exceptionResponse.message;
    }

    return exception.message;
  } // cấu hình lại messgae lỗi
}
