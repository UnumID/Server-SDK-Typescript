/*
 * File for default config values.
 * Can handle populating values via env vars at build time, i.e. PORT=9090 node build/server.js
 */
import dotenv from 'dotenv';

dotenv.config();

const configData = {
  SaaSUrl: process.env.SAAS_URL || 'https://api.sandbox-unumid.org/',
  logLevel: process.env.LOG_LEVEL || 'info' // Turns out Winston defaults to info if the LOG_LEVEL is not present but just setting explicitly anyway.
};

export { configData };
