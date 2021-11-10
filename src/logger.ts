import { createLogger, format, transports } from 'winston';
import { configData } from './config';

// Only adding the timestamp if running locally. Otherwise the timestamp is little redundant when can be added in supplementary fashion outside of the message itself.
const consoleFormat = configData.nodeEnv === 'local'
  ? format.combine(
    format.colorize(),
    format.timestamp({
      format: 'HH:mm.ss.SSS'
    }),
    format.printf(info => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    })
  )
  : format.combine(
    format.printf(info => {
      return `${info.level}: ${info.message}`;
    })
  );

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.errors({ stack: true })
  ),
  transports: [
    new transports.Console({
      level: configData.logLevel || 'info',
      format: consoleFormat
    })
  ],
  silent: process.env.NODE_ENV === 'test'
});

// Printing this info here instead of in ./config to prevent a circular dependency.
logger.debug(`Server SDK v3 SaaS URL: ${configData.SaaSUrl}`);
logger.debug(`Server SDK v3 Log Level: ${configData.logLevel}`);

export default logger;
