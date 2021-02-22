"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configData = void 0;
/*
 * File for default config values.
 * Can handle populating values via env vars at build time, i.e. PORT=9090 node build/server.js
 */
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var configData = {
    nodeEnv: process.env.NODE_ENV || 'sandbox',
    SaaSUrl: process.env.SAAS_URL || 'https://api.sandbox-unumid.org/',
    logLevel: process.env.LOG_LEVEL || 'debug' // Winston defaults to info if not set
};
exports.configData = configData;
//# sourceMappingURL=config.js.map