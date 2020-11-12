"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
var registerVerifier_1 = require("./registerVerifier");
var sendRequest_1 = require("./sendRequest");
var verifyPresentation_1 = require("./verifyPresentation");
var logger_1 = __importDefault(require("./logger"));
var verifyNoPresentation_1 = require("./verifyNoPresentation");
var sendSms_1 = require("./sendSms");
var sendEmail_1 = require("./sendEmail");
var app = library_issuer_verifier_utility_1.initServer();
exports.app = app;
app.use(function (req, res, next) {
    var path = req.path, body = req.body, method = req.method, headers = req.headers;
    logger_1.default.info(method + " " + path);
    logger_1.default.info("body: " + JSON.stringify(body));
    logger_1.default.info("headers: " + JSON.stringify(headers));
    next();
});
app.post('/api/register', registerVerifier_1.registerVerifier);
app.post('/api/sendRequest', sendRequest_1.sendRequest);
app.post('/api/verifyPresentation', verifyPresentation_1.verifyPresentation);
app.post('/api/verifyNoPresentation', verifyNoPresentation_1.verifyNoPresentation);
app.post('/api/sendSms', sendSms_1.sendSms);
app.post('/api/sendEmail', sendEmail_1.sendEmail);
app.use(function (err, req, res, next) {
    library_issuer_verifier_utility_1.customErrFormatter(err, res);
    logger_1.default.warn(err);
    next(err);
});
