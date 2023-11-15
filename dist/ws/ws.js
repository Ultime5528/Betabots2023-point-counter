"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
const config_1 = require("../config");
const logger_1 = require("../logger");
const socket_io_1 = require("socket.io");
class WebSocketServer {
    constructor(server) {
        this.port = config_1.Configuration.port;
        this.ssl = config_1.Configuration.ssl;
        this.sslKeyLoc = config_1.Configuration.sslKeyLoc;
        this.sslCertLoc = config_1.Configuration.sslCertLoc;
        this.server = server;
        this.io = null;
        this.sockets = [];
    }
    setup() {
        logger_1.Logger.log('Setting up WebSocket server...');
        this.io = new socket_io_1.Server(this.server);
        this.io.on('connection', this.onConnection);
        this.io.on('disconnect', this.onDisconnect);
    }
    onDisconnect(socket) {
        this.sockets = this.sockets.filter(s => s !== socket);
    }
    onConnection(socket) {
        this.sockets.push(socket);
        socket.on('message', (msg) => {
            logger_1.Logger.log(`Received message: ${msg}`);
            this.io.emit('message', msg);
        });
    }
    start() {
        logger_1.Logger.log('Starting WebSocket server...');
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=ws.js.map