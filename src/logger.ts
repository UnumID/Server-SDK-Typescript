import { createLogger, format, transports } from 'winston';
import winston from 'winston/lib/winston/config';
import { configData } from './config';

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  levels: winston.syslog.levels,
  format: format.combine(
    format.splat(),
    format.timestamp(),
    format.colorize(),
    format.errors({ stack: true }),
    format.simple()
  ),
  transports: [
    new transports.Console({ level: configData.logLevel })
  ],
  silent: process.env.NODE_ENV === 'test'
});

// Printing this info here instead of in ./config to prevent a circular dependency.
logger.debug(`Server SDK SaaS URL: ${configData.SaaSUrl}`);
logger.debug(`Server SDK Log Level: ${configData.logLevel}`);

export default logger;
