import { createLogger, format, transports } from 'winston';
import { Syslog } from 'winston-syslog';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();
const localhost = os.hostname();

// only if LOGGING_ENV is set to internal should the logs be reported to paper trail
const options = (process.env.LOGGING_ENV === 'internal') ? {
  host: 'logs.papertrailapp.com',
  port: parseInt(process.env.PAPERTRAIL_PORT || ''),

  app_name: 'verifier-server-app',
  localhost
} : {};

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  // To see more detailed errors, change the LOG_LEVEL env var to debug, i.e. LOG_LEVEL=debug
  level: process.env.LOG_LEVEL || 'info', // Turns out Winston defaults to info if the LOG_LEVEL is not present but just setting explicitly anyway.
  format: format.combine(
    format.splat(),
    format.timestamp(),
    format.colorize(),
    format.errors({ stack: true }),
    format.simple()
  ),
  transports: [
    new transports.Console(),
    new Syslog(options)
  ],
  silent: process.env.NODE_ENV === 'test'
});

export default logger;
