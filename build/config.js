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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxrREFBNEI7QUFFNUIsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQjs7O0dBR0c7QUFDSCxTQUFTLFVBQVUsQ0FBRSxHQUFXO0lBQzlCLFFBQVEsR0FBRyxFQUFFO1FBQ1gsS0FBSyxPQUFPO1lBQ1YsT0FBTyx3QkFBd0IsQ0FBQztRQUNsQyxLQUFLLEtBQUs7WUFDUixPQUFPLDRCQUE0QixDQUFDO1FBQ3RDLEtBQUssU0FBUztZQUNaLE9BQU8sZ0NBQWdDLENBQUM7UUFDMUMsS0FBSyxZQUFZO1lBQ2YsT0FBTyx3QkFBd0IsQ0FBQztRQUNsQztZQUNFLE9BQU8sd0JBQXdCLENBQUM7S0FDbkM7QUFDSCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBRSxHQUFXO0lBQ3hDLFFBQVEsR0FBRyxFQUFFO1FBQ1gsS0FBSyxPQUFPO1lBQ1YsT0FBTyxzQ0FBc0MsQ0FBQztRQUNoRCxLQUFLLEtBQUs7WUFDUixPQUFPLHNDQUFzQyxDQUFDO1FBQ2hELEtBQUssU0FBUztZQUNaLE9BQU8sc0NBQXNDLENBQUM7UUFDaEQsS0FBSyxZQUFZO1lBQ2YsT0FBTyxzQ0FBc0MsQ0FBQztRQUNoRDtZQUNFLE9BQU8sc0NBQXNDLENBQUM7S0FDakQ7QUFDSCxDQUFDO0FBRUQsc0NBQXNDO0FBQ3RDLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQztBQUU5QyxJQUFNLFVBQVUsR0FBRztJQUNqQixPQUFPLEVBQUUsR0FBRztJQUNaLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDO0lBQ3JELG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLEdBQUcsQ0FBQztJQUM5QyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssTUFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLE1BQU0sSUFBSSxLQUFLO0lBQ2pGLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsa0VBQWtFO0NBQzNJLENBQUM7QUFFTyxnQ0FBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBGaWxlIGZvciBkZWZhdWx0IGNvbmZpZyB2YWx1ZXMuXG4gKiBDYW4gaGFuZGxlIHBvcHVsYXRpbmcgdmFsdWVzIHZpYSBlbnYgdmFycyBhdCBidWlsZCB0aW1lLCBpLmUuIFBPUlQ9OTA5MCBub2RlIGJ1aWxkL3NlcnZlci5qc1xuICovXG5pbXBvcnQgZG90ZW52IGZyb20gJ2RvdGVudic7XG5cbmRvdGVudi5jb25maWcoKTtcblxuLyoqXG4gKiBHZXQgc2FhcyB1cmwgYmFzZWQgb24gdGhlIHByb3ZpZGUgVU5VTV9FTlYgZW52IHZhci5cbiAqIEBwYXJhbSBlbnZcbiAqL1xuZnVuY3Rpb24gZ2V0U2Fhc1VybCAoZW52OiBzdHJpbmcpIHtcbiAgc3dpdGNoIChlbnYpIHtcbiAgICBjYXNlICdsb2NhbCc6XG4gICAgICByZXR1cm4gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAzMC8nO1xuICAgIGNhc2UgJ2Rldic6XG4gICAgICByZXR1cm4gJ2h0dHBzOi8vYXBpLmRldi11bnVtaWQuY28vJztcbiAgICBjYXNlICdzYW5kYm94JzpcbiAgICAgIHJldHVybiAnaHR0cHM6Ly9hcGkuc2FuZGJveC11bnVtaWQuY28vJztcbiAgICBjYXNlICdwcm9kdWN0aW9uJzpcbiAgICAgIHJldHVybiAnaHR0cHM6Ly9hcGkudW51bWlkLmNvLyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnaHR0cDovL2xvY2FsaG9zdDozMDMwLyc7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgc2FhcyB1cmwgYmFzZWQgb24gdGhlIHByb3ZpZGUgVU5VTV9FTlYgZW52IHZhci5cbiAqIEBwYXJhbSBlbnZcbiAqL1xuZnVuY3Rpb24gZ2V0VW51bUhvbGRlckFwcFV1aWQgKGVudjogc3RyaW5nKSB7XG4gIHN3aXRjaCAoZW52KSB7XG4gICAgY2FzZSAnbG9jYWwnOlxuICAgICAgcmV0dXJuICc4NjgxMGMxMy00N2I0LTRhMmItYWU0Ni1mYjEzYjZhNTE3N2EnO1xuICAgIGNhc2UgJ2Rldic6XG4gICAgICByZXR1cm4gJzg2ODEwYzEzLTQ3YjQtNGEyYi1hZTQ2LWZiMTNiNmE1MTc3YSc7XG4gICAgY2FzZSAnc2FuZGJveCc6XG4gICAgICByZXR1cm4gJ2I4ODIwZWY3LThhZTgtNGZhOS05YTk5LTg0NjI5YjJlYTE0Nyc7XG4gICAgY2FzZSAncHJvZHVjdGlvbic6XG4gICAgICByZXR1cm4gJzdhMWIwZTM3LWVmZGEtNGI5Mi04NzNiLWFkN2E4NDkxMTc1ZCc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnYjg4MjBlZjctOGFlOC00ZmE5LTlhOTktODQ2MjliMmVhMTQ3JztcbiAgfVxufVxuXG4vLyBkZWZhdWx0cyB0byBzYW5kYm94IGlmIG5vdCBwcm92aWRlZFxuY29uc3QgZW52ID0gcHJvY2Vzcy5lbnYuVU5VTV9FTlYgfHwgJ3NhbmRib3gnO1xuXG5jb25zdCBjb25maWdEYXRhID0ge1xuICBub2RlRW52OiBlbnYsXG4gIFNhYVNVcmw6IHByb2Nlc3MuZW52LlVOVU1fU0FBU19VUkwgfHwgZ2V0U2Fhc1VybChlbnYpLFxuICB1bnVtV2FsbGV0SG9sZGVyQXBwOiBnZXRVbnVtSG9sZGVyQXBwVXVpZChlbnYpLFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuVU5VTV9ERUJVRyA9PT0gJ3RydWUnIHx8IHByb2Nlc3MuZW52LkRFQlVHID09PSAndHJ1ZScgfHwgZmFsc2UsXG4gIGxvZ0xldmVsOiBwcm9jZXNzLmVudi5VTlVNX0xPR19MRVZFTCB8fCBwcm9jZXNzLmVudi5MT0dfTEVWRUwgfHwgJ2luZm8nIC8vIFdpbnN0b24gZGVmYXVsdHMgdG8gaW5mbyBpZiBub3Qgc2V0IGhvd2V2ZXIgYmVpbmcgZXhwbGljaXQgaGVyZVxufTtcblxuZXhwb3J0IHsgY29uZmlnRGF0YSB9O1xuIl19