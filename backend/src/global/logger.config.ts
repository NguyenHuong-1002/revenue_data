import * as winston from 'winston';
import 'winston-daily-rotate-file';
import type { TransformableInfo } from 'logform';
const { combine, timestamp, colorize, json, errors, printf, splat } = winston.format;

interface LogInfo extends TransformableInfo {
  timestamp?: string;
  context?: string;
  stack?: string;
}

const consoleFormat = printf(
  ({ timestamp, level, message, context, stack, ...metaData }: LogInfo) => {
    const ctx = context ? ` [${context}]` : '';
    const stackTrace = stack ? `\n${stack}` : '';
    const meta = Object.keys(metaData).length > 0 ? ` ${JSON.stringify(metaData)}` : '';
    const text = typeof message === 'string' ? message : JSON.stringify(message);

    return `${timestamp} ${level}${ctx} ${text}${meta}${stackTrace}`;
  },
);

const createBaseFormat = () =>
  combine(errors({ stack: true }), splat(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }));

export function createWinstonLoggerOptions(): winston.LoggerOptions {
  return {
    level: 'info',
    format: createBaseFormat(),
    transports: [
      new winston.transports.Console({
        format: combine(createBaseFormat(), colorize(), consoleFormat),
      }),
      new winston.transports.DailyRotateFile({
        level: 'info',
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: combine(createBaseFormat(), json()),
      }),
      new winston.transports.DailyRotateFile({
        level: 'error',
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: combine(createBaseFormat(), json()),
      }),
    ],
  };
}
