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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxrREFBNEI7QUFFNUIsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQixJQUFNLFVBQVUsR0FBRztJQUNqQixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksU0FBUztJQUMxQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksaUNBQWlDO0lBQ2xFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxPQUFPLENBQUMsc0NBQXNDO0NBQ2xGLENBQUM7QUFFTyxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBGaWxlIGZvciBkZWZhdWx0IGNvbmZpZyB2YWx1ZXMuXG4gKiBDYW4gaGFuZGxlIHBvcHVsYXRpbmcgdmFsdWVzIHZpYSBlbnYgdmFycyBhdCBidWlsZCB0aW1lLCBpLmUuIFBPUlQ9OTA5MCBub2RlIGJ1aWxkL3NlcnZlci5qc1xuICovXG5pbXBvcnQgZG90ZW52IGZyb20gJ2RvdGVudic7XG5cbmRvdGVudi5jb25maWcoKTtcblxuY29uc3QgY29uZmlnRGF0YSA9IHtcbiAgbm9kZUVudjogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ3NhbmRib3gnLFxuICBTYWFTVXJsOiBwcm9jZXNzLmVudi5TQUFTX1VSTCB8fCAnaHR0cHM6Ly9hcGkuc2FuZGJveC11bnVtaWQub3JnLycsXG4gIGxvZ0xldmVsOiBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ2RlYnVnJyAvLyBXaW5zdG9uIGRlZmF1bHRzIHRvIGluZm8gaWYgbm90IHNldFxufTtcblxuZXhwb3J0IHsgY29uZmlnRGF0YSB9O1xuIl19