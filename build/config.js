"use strict";
// File for config values.
// Using .ts file so can add comments and can handle populating values via env vars at build time, i.e. PORT=9090 node build/server.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.configData = void 0;
var configData = {
    port: process.env.PORT || '8080',
    SaaSUrl: process.env.SAAS_URL || 'https://api.dev-unumid.org/',
    IssuerAppUrl: process.env.ISSUER_APP_URL || 'https://issuer.dev-unumid.org/'
};
exports.configData = configData;
