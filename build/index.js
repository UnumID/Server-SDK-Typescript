"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
var config_1 = require("./config");
var registerVerifier_1 = require("./registerVerifier");
var app = library_issuer_verifier_utility_1.initServer();
exports.app = app;
app.post('/api/register', registerVerifier_1.registerVerifier);
app.use(function (err, req, res, next) {
    library_issuer_verifier_utility_1.customErrFormatter(err, res);
    next(err);
});
library_issuer_verifier_utility_1.startServer(config_1.configData.port, app);
