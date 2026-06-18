import * as winston from 'winston';
import 'winston-daily-rotate-file';

// Interface winstongLog
export interface WinstonLog {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  correlationId?: string;
  stack?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  ip?: string;
}

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const logFormat = printf(({ timestamp, level, message, context, stack, ...meta }) => {
  const ctx = context ? `[${context}]` : '';
  const stackTrace = stack ? `\n${stack}` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${level} ${ctx} ${message}${metaStr}${stackTrace}`;
});

export function createWinstonLoggerOptions(): winston.LoggerOptions {
  return {
    level: 'debug',
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
    transports: [
      new winston.transports.Console({
        level: 'debug',
        format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
      }),
      new winston.transports.DailyRotateFile({
        level: 'info',
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
      }),
      new winston.transports.DailyRotateFile({
        level: 'error',
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
      }),
    ],
  };
}

export function createWinstonLogger(): winston.Logger {
  return winston.createLogger(createWinstonLoggerOptions());
}
