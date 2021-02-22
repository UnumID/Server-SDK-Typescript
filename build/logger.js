"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var config_1 = require("./config");
// Only adding the timestamp if running locally. Otherwise the timestamp is little redundant when can be added in supplementary fashion outside of the message itself.
var consoleFormat = config_1.configData.nodeEnv === 'local'
    ? winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({
        format: 'HH:mm.ss.SSSz'
    }), winston_1.format.printf(function (info) {
        return info.timestamp + " " + info.level + ": " + info.message;
    }))
    : winston_1.format.combine(winston_1.format.printf(function (info) {
        return info.level + ": " + info.message;
    }));
// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
var logger = winston_1.createLogger({
    format: winston_1.format.combine(winston_1.format.splat(), winston_1.format.errors({ stack: true })),
    transports: [
        new winston_1.transports.Console({
            level: config_1.configData.logLevel || 'debug',
            format: consoleFormat
        })
    ],
    silent: process.env.NODE_ENV === 'test'
});
// Printing this info here instead of in ./config to prevent a circular dependency.
logger.debug("Server SDK SaaS URL: " + config_1.configData.SaaSUrl);
logger.debug("Server SDK Log Level: " + config_1.configData.logLevel);
exports.default = logger;
//# sourceMappingURL=logger.js.map