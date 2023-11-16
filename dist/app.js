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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const ws_1 = require("./ws/ws");
const webserver_1 = require("./webserver/webserver");
const logger_1 = require("./logger");
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const app = (0, express_1.default)();
const server = config_1.Configuration.ssl ? https.createServer({ key: fs.readFileSync(config_1.Configuration.sslKeyLoc), cert: fs.readFileSync(config_1.Configuration.sslCertLoc) }, app) : http.createServer(app);
const ws = new ws_1.WebSocketServer(server);
ws.setup();
const webserver = new webserver_1.WebServer(app);
webserver.setup();
server.listen(config_1.Configuration.port, () => {
    logger_1.Logger.log(`Server started on port ${config_1.Configuration.port}`);
});
//# sourceMappingURL=app.js.map