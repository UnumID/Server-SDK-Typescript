/*
 * File for default config values.
 * Can handle populating values via env vars at build time, i.e. PORT=9090 node build/server.js
 */
import dotenv from 'dotenv';

dotenv.config();

/**
 * Get saas url based on the provide UNUM_ENV env var.
 * @param env
 */
function getSaasUrl (env: string) {
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
      return 'http://localhost:3030/';
  }
}

// defaults to sandbox if not provided
const env = process.env.UNUM_ENV || 'sandbox';

const configData = {
  nodeEnv: env,
  SaaSUrl: getSaasUrl(env),
  debug: process.env.DEBUG || false,
  logLevel: process.env.LOG_LEVEL || 'info' // Winston defaults to info if not set however being explicit here
};

export { configData };
