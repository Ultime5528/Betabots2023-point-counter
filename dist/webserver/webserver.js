"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebServer = void 0;
const config_1 = require("../config");
const express = __importStar(require("express"));
class WebServer {
    constructor(app) {
        this.port = config_1.Configuration.port;
        this.ssl = config_1.Configuration.ssl;
        this.sslKeyLoc = config_1.Configuration.sslKeyLoc;
        this.sslCertLoc = config_1.Configuration.sslCertLoc;
        this.app = app;
    }
    setup() {
        console.log('Setting up WebServer...');
        this.app.use(express.static('www'));
    }
}
exports.WebServer = WebServer;
//# sourceMappingURL=webserver.js.map