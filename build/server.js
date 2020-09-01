"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var library_issuer_verifier_utility_1 = require("library-issuer-verifier-utility");
var config_1 = require("./config");
var index_1 = require("./index");
library_issuer_verifier_utility_1.startServer(config_1.configData.port, index_1.app);
