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
      return 'https://api.dev-unumid.co/';
    case 'sandbox':
      return 'https://api.sandbox-unumid.co/';
    case 'production':
      return 'https://api.unumid.co/';
    default:
      return 'http://localhost:3030/';
  }
}

// defaults to sandbox if not provided
const env = process.env.UNUM_ENV || 'sandbox';

const configData = {
  nodeEnv: env,
  SaaSUrl: process.env.UNUM_SAAS_URL || getSaasUrl(env),
  debug: process.env.UNUM_DEBUG === 'true' || process.env.DEBUG === 'true' || false,
  logLevel: process.env.UNUM_LOG_LEVEL || process.env.LOG_LEVEL || 'info' // Winston defaults to info if not set however being explicit here
};

export { configData };
