/*
 * File for default config values.
 * Can handle populating values via env vars at build time, i.e. PORT=9090 node build/server.js
 */
import dotenv from 'dotenv';

dotenv.config();

/**
 * Get saas url based on the provide NODE_ENV env var.
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
      return 'need_to_populate_NODE_ENV_env_var';
  }
}

const configData = {
  nodeEnv: process.env.NODE_ENV || 'sandbox',
  SaaSUrl: getSaasUrl(process.env.NODE_ENV as string),
  logLevel: process.env.LOG_LEVEL || 'debug' // Winston defaults to info if not set
};

export { configData };
