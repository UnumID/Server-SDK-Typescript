import { createLogger, format, transports } from 'winston';
import { Syslog } from 'winston-syslog';
import { configData } from './config';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();
const localhost = os.hostname();

// Only if LOGGING_ENV is set to internal should the logs be reported to paper trail.
// This is still a temporary solution as it would be much better to have a logging agent
// at the infrastructure level not the application. For this reason not including LOGGING_ENV
// in the app's config.ts, configData.
// NOTE: THIS PROBABLY OUGHT TO BE DELETED PRIOR TO PUBLISHING PUBLICLY.
const options = (process.env.LOGGING_ENV === 'internal') ? {
  host: 'logs.papertrailapp.com',
  port: parseInt(process.env.PAPERTRAIL_PORT || ''),

  app_name: 'verifier-server-app',
  localhost
} : {};

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  // To see more detailed errors, change the LOG_LEVEL env var to debug, i.e. LOG_LEVEL=debug
  level: configData.logLevel,
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
