"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var winston_syslog_1 = require("winston-syslog");
var dotenv_1 = __importDefault(require("dotenv"));
var os_1 = __importDefault(require("os"));
dotenv_1.default.config();
var localhost = os_1.default.hostname();
// if the LOGGING_DISABLED env var is set to anything or
var options = (process.env.LOGGING_ENV === 'internal') ? {
    host: 'logs.papertrailapp.com',
    port: parseInt(process.env.PAPERTRAIL_PORT || ''),
    app_name: 'verifier-server-app',
    localhost: localhost
} : {};
// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
var logger = winston_1.createLogger({
    // To see more detailed errors, change this to 'debug'
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.format.combine(winston_1.format.splat(), winston_1.format.timestamp(), winston_1.format.colorize(), winston_1.format.errors({ stack: true }), winston_1.format.simple()),
    transports: [
        new winston_1.transports.Console(),
        new winston_syslog_1.Syslog(options)
    ],
    silent: process.env.NODE_ENV === 'test'
});
exports.default = logger;
