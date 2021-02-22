/*
 * File for default config values.
 * Can handle populating values via env vars at build time, i.e. PORT=9090 node build/server.js
 */
import dotenv from 'dotenv';

dotenv.config();

const configData = {
  nodeEnv: process.env.NODE_ENV || 'sandbox',
  SaaSUrl: process.env.SAAS_URL || 'https://api.sandbox-unumid.org/',
  logLevel: process.env.LOG_LEVEL || 'debug' // Winston defaults to info if not set
};

export { configData };
