"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
var registerVerifier_1 = require("./registerVerifier");
var sendRequest_1 = require("./sendRequest");
var app = library_issuer_verifier_utility_1.initServer();
exports.app = app;
app.post('/api/register', registerVerifier_1.registerVerifier);
app.post('/api/sendRequest', sendRequest_1.sendRequest);
app.use(function (err, req, res, next) {
    library_issuer_verifier_utility_1.customErrFormatter(err, res);
    next(err);
});
