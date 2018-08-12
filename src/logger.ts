import * as winston from 'winston';

const logFormat = winston.format.printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level.toUpperCase()}: ${
    info.message
  }`;
});

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4
};

export const logger = winston.createLogger({
  level: 'verbose',
  levels: levels,
  transports: [new winston.transports.File({ filename: 'app.log' })],
  format: winston.format.combine(
    winston.format.label({ label: 'jarvis-server' }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  )
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.label({ label: 'jarvis-server' }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => {
          return `${info.timestamp} [${info.label}] ${info.level}: ${
            info.message
          }`;
        })
      )
    })
  );
}
