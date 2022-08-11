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
 * Get saas url based on the provide UNUM_ENV env var.
 * @param env
 */
function getSaasUrl(env) {
    switch (env) {
        case 'local':
            return 'http://localhost:3030/';
        case 'dev':
            return 'https://api.dev-unumid.co/';
        case 'sandbox':
            return 'https://api.sandbox-unumid.co/';
        case 'production':
            return 'https://api.unumid.co/';
        default:
            return 'http://localhost:3030/';
    }
}
/**
 * Get saas url based on the provide UNUM_ENV env var.
 * @param env
 */
function getUnumHolderAppUuid(env) {
    switch (env) {
        case 'local':
            return '86810c13-47b4-4a2b-ae46-fb13b6a5177a';
        case 'dev':
            return '86810c13-47b4-4a2b-ae46-fb13b6a5177a';
        case 'sandbox':
            return 'b8820ef7-8ae8-4fa9-9a99-84629b2ea147';
        case 'production':
            return '7a1b0e37-efda-4b92-873b-ad7a8491175d';
        default:
            return 'b8820ef7-8ae8-4fa9-9a99-84629b2ea147';
    }
}
// defaults to sandbox if not provided
var env = process.env.UNUM_ENV || 'sandbox';
var configData = {
    nodeEnv: env,
    SaaSUrl: process.env.UNUM_SAAS_URL || getSaasUrl(env),
    unumWalletHolderApp: getUnumHolderAppUuid(env),
    debug: process.env.UNUM_DEBUG === 'true' || process.env.DEBUG === 'true' || false,
    logLevel: process.env.UNUM_LOG_LEVEL || process.env.LOG_LEVEL || 'info' // Winston defaults to info if not set however being explicit here
};
exports.configData = configData;
//# sourceMappingURL=config.js.map