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
/**
 * Get saas url based on the provide NODE_ENV env var.
 * @param env
 */
function getSaasUrl(env) {
    switch (env) {
        case 'local':
            return 'http://localhost:3030/';
        case 'dev':
            return 'https://api.dev-unum.id/';
        case 'sandbox':
            return 'https://api.sandbox-unum.id/';
        case 'production':
            return 'https://api.unum.id/';
        default:
            return 'need_to_populate_NODE_ENV_env_var';
    }
}
var configData = {
    nodeEnv: process.env.NODE_ENV || 'sandbox',
    SaaSUrl: getSaasUrl(process.env.NODE_ENV),
    logLevel: process.env.LOG_LEVEL || 'debug' // Winston defaults to info if not set
};
exports.configData = configData;
//# sourceMappingURL=config.js.map