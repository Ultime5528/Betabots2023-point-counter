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
exports.WebSocketServer = void 0;
const config_1 = require("../config");
const logger_1 = require("../logger");
const connectiontypes_1 = require("./connectiontypes");
const ws = __importStar(require("ws"));
const parser_1 = require("./parser");
class WebSocketServer {
    constructor(server) {
        this.port = config_1.Configuration.port;
        this.ssl = config_1.Configuration.ssl;
        this.sslKeyLoc = config_1.Configuration.sslKeyLoc;
        this.sslCertLoc = config_1.Configuration.sslCertLoc;
        this.server = server;
        this.wsserver = new ws.Server({ noServer: true });
        this.sockets = [];
    }
    setup() {
        logger_1.Logger.log('Setting up WebSocket Server.');
        if (config_1.Configuration.controllerPass === "") {
            logger_1.Logger.warn("WARNING: Controller password is not set. It is not recommended to leave it empty for competition use.");
        }
        this.wsserver.on('connection', this.onConnection.bind(this));
        this.wsserver.on('disconnect', this.onDisconnect.bind(this));
        this.server.on('upgrade', (request, socket, head) => {
            this.wsserver.handleUpgrade(request, socket, head, socket => {
                this.wsserver.emit('connection', socket, request);
            });
        });
    }
    onDisconnect(socket) {
        this.sockets = this.sockets.filter(s => s !== socket);
    }
    onConnection(socket) {
        let id = this.sockets.push([socket, connectiontypes_1.ConnectionType.UNKNOWN]) - 1;
        let authenticated = false;
        let deviceType = connectiontypes_1.ConnectionType.UNKNOWN;
        socket.on('message', (message) => {
            const msg = parser_1.MessageParser.parse(message.toString());
            if (msg.type === "auth" && msg.data.deviceType === connectiontypes_1.ConnectionType.CONTROLLER) {
                if (config_1.Configuration.controllerPass !== "") {
                    if (msg.data.pass === config_1.Configuration.controllerPass) {
                        authenticated = true;
                        deviceType = msg.data.deviceType;
                        this.sockets[id][1] = deviceType;
                        logger_1.Logger.log(`Device of type ${deviceType} authenticated.`);
                    }
                    else {
                        socket.close();
                    }
                }
                else {
                    authenticated = true;
                    deviceType = msg.data.deviceType;
                    this.sockets[id][1] = deviceType;
                    logger_1.Logger.log(`Device of type ${deviceType} authenticated.`);
                }
            }
            else if (msg.type === "auth" && msg.data.deviceType === connectiontypes_1.ConnectionType.LIVE) {
                deviceType = msg.data.deviceType;
                this.sockets[id][1] = deviceType;
                logger_1.Logger.log(`Live device connected.`);
            }
            if (authenticated && deviceType === connectiontypes_1.ConnectionType.CONTROLLER) {
                if (msg.type === "flowers") {
                    /*
                    flowers_obj: [

                    ],
                    points: {
                        yellow: number,
                        green: number
                    }
                    flowers: {
                        yellow: number,
                        green: number
                    }
                    */
                    this.sockets.forEach(s => {
                        if (s[0] !== socket && s[1] === connectiontypes_1.ConnectionType.LIVE) {
                            s[0].send(JSON.stringify(msg));
                        }
                    });
                }
                if (msg.type === "match") {
                    /*
                    timeleft: number
                    teams: {
                        yellow: {
                            teamnumber: number
                        },
                        green: {
                            teamnumber: number
                        }
                    }
                    nextMatch: {
                        yellow: {
                            teamnumber: number
                        },
                        green: {
                            teamnumber: number
                        }
                    }
                    */
                    this.sockets.forEach(s => {
                        if (s[0] !== socket && s[1] === connectiontypes_1.ConnectionType.LIVE) {
                            s[0].send(JSON.stringify(msg));
                        }
                    });
                }
            }
        });
        setTimeout(() => {
            if (!authenticated && deviceType === connectiontypes_1.ConnectionType.UNKNOWN) {
                socket.send(JSON.stringify({ type: "auth", data: { error: "Timed out." } }));
                socket.close();
            }
        }, 5000);
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=ws.js.map