import { LEVEL, SPLAT } from 'triple-beam';
import * as winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4
};

const label = 'aida-server';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const logFormat = winston.format.combine(
  winston.format(info => {
    info.level = info.level.replace(info[LEVEL], info[LEVEL].toUpperCase());

    return info;
  })(),
  winston.format.label({ label }),
  winston.format.timestamp({ format: dateFormat }),
  winston.format.printf(info => {
    const logMessage = `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;

    if (info[SPLAT]) {
      const splat = info[SPLAT].map(a => JSON.stringify(a)).join(', ');

      return `${logMessage} | ${splat}`;
    }

    return logMessage;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  levels,
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.Console({
      format: winston.format.combine(logFormat)
    })
  ],
  format: logFormat
});

if (process.env.NODE_ENV !== 'production') {
  logger.transports[1].format = winston.format.combine(
    winston.format.colorize(),
    logFormat
  );
  logger.level = 'verbose';
}
