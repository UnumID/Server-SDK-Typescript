"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var config_1 = __importDefault(require("winston/lib/winston/config"));
var config_2 = require("./config");
// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
var logger = winston_1.createLogger({
    levels: config_1.default.syslog.levels,
    format: winston_1.format.combine(winston_1.format.splat(), winston_1.format.timestamp(), winston_1.format.colorize(), winston_1.format.errors({ stack: true }), winston_1.format.simple()),
    transports: [
        new winston_1.transports.Console({ level: config_2.configData.logLevel })
    ],
    silent: process.env.NODE_ENV === 'test'
});
// Printing this info here instead of in ./config to prevent a circular dependency.
logger.debug("Server SDK SaaS URL: " + config_2.configData.SaaSUrl);
logger.debug("Server SDK Log Level: " + config_2.configData.logLevel);
exports.default = logger;
//# sourceMappingURL=logger.js.map