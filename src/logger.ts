import { createLogger, format, transports } from 'winston';
import { Syslog } from 'winston-syslog';
import { configData } from './config';
import dotenv from 'dotenv';
import os from 'os';
import winston from 'winston/lib/winston/config';

dotenv.config();

const logLevel = process.env.LOG_LEVEL || 'info'; // Turns out Winston defaults to info if the LOG_LEVEL is not present but just setting explicitly anyway.

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
    new transports.Console({ level: logLevel })
  ],
  silent: process.env.NODE_ENV === 'test'
});

export default logger;
