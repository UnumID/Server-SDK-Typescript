"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var dotenv_1 = __importDefault(require("dotenv"));
var config_1 = __importDefault(require("winston/lib/winston/config"));
dotenv_1.default.config();
var logLevel = process.env.LOG_LEVEL || 'info'; // Turns out Winston defaults to info if the LOG_LEVEL is not present but just setting explicitly anyway.
// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
var logger = winston_1.createLogger({
    levels: config_1.default.syslog.levels,
    format: winston_1.format.combine(winston_1.format.splat(), winston_1.format.timestamp(), winston_1.format.colorize(), winston_1.format.errors({ stack: true }), winston_1.format.simple()),
    transports: [
        new winston_1.transports.Console({ level: logLevel })
    ],
    silent: process.env.NODE_ENV === 'test'
});
exports.default = logger;
//# sourceMappingURL=logger.js.map