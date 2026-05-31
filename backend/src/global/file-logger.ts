/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

export class FileLogger extends ConsoleLogger {
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly logFile = path.join(this.logDir, 'system.log');

  error(message: unknown, stack?: string, context?: string) {
    // 1. Gọi logger mặc định của NestJS để hiển thị trên console có màu sắc
    super.error(message, stack, context);

    // 2. Ghi đè vào tệp logs/system.log theo đúng định dạng được yêu cầu
    this.writeToLogFile('ERROR', message, context, stack);
  }

  warn(message: unknown, context?: string) {
    super.warn(message, context);
    this.writeToLogFile('WARN', message, context);
  }

  private writeToLogFile(level: string, message: unknown, context?: string, stack?: string) {
    try {
      const pid = process.pid;

      // Định dạng ngày giờ chuẩn: MM/DD/YYYY, H:MM:SS AM/PM
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      });

      const ctx = context ? `[${context}] ` : '';
      const msgText = typeof message === 'object' ? JSON.stringify(message) : message;

      let logMessage = `[Nest] ${pid}  - ${timestamp}   ${level.padEnd(5)} ${ctx}${msgText}\n`;

      if (stack) {
        logMessage += `${stack}\n`;
      }

      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      fs.appendFileSync(this.logFile, logMessage, 'utf-8');
    } catch (err) {
      // Bắt mọi lỗi ghi log để không làm sập ứng dụng chính
    }
  }
}
