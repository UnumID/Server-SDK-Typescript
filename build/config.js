"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configData = void 0;
// File for config values.
// Using .ts file so can add comments and can handle populating values via env vars at build time, i.e. PORT=9090 node build/server.js
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var configData = {
    port: process.env.PORT || '8080',
    SaaSUrl: process.env.SAAS_URL || 'https://api.dev-unumid.org/',
    IssuerAppUrl: process.env.ISSUER_APP_URL || 'https://issuer.dev-unumid.org/',
    logLevel: process.env.LOG_LEVEL || 'info' // Turns out Winston defaults to info if the LOG_LEVEL is not present but just setting explicitly anyway.
};
exports.configData = configData;
