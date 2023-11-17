import { Configuration } from "../config";
import { Logger } from "../logger";
import { ConnectionType } from "./connectiontypes";

import * as ws from "ws";
import * as https from "https";
import * as http from "http";
import { MessageParser } from "./parser";


export class WebSocketServer {
    port: number;
    ssl: boolean;
    sslKeyLoc: string;
    sslCertLoc: string;
    server: http.Server | https.Server;
    sockets: ws.Socket[];
    wsserver: ws.Server;

    constructor(server: http.Server | https.Server) {
        this.port = Configuration.port;
        this.ssl = Configuration.ssl;
        this.sslKeyLoc = Configuration.sslKeyLoc;
        this.sslCertLoc = Configuration.sslCertLoc;
        this.server = server;
        this.wsserver = new ws.Server({ noServer: true });
        this.sockets = [];
    }

    setup(): void {
        Logger.log('Setting up WebSocket Server.');

        if(Configuration.controllerPass === "") {
            Logger.warn("WARNING: Controller password is not set. It is not recommended to leave it empty for competition use.");
        }

        this.wsserver.on('connection', this.onConnection.bind(this));
        this.wsserver.on('disconnect', this.onDisconnect.bind(this));

        this.server.on('upgrade', (request, socket, head) => {
            this.wsserver.handleUpgrade(request, socket, head, socket => {
                this.wsserver.emit('connection', socket, request);
            });
        });
        
    }

    onDisconnect(socket: ws.Socket) {
        this.sockets = this.sockets.filter(s => s !== socket);
    }

    onConnection(socket: ws.Socket) {
        let id = this.sockets.push([socket, ConnectionType.UNKNOWN])-1;
        let authenticated = false;
        let deviceType: ConnectionType = ConnectionType.UNKNOWN;

        socket.on('message', (message: Buffer) => {
            const msg = MessageParser.parse(message.toString());

            if(!authenticated) {
                if(msg.type === "auth" && msg.data.deviceType === ConnectionType.CONTROLLER) {
                    // Controller devices need to authenticate because they can change the data on live devices.
                    if(Configuration.controllerPass !== "") {
                        if(msg.data.pass === Configuration.controllerPass) {
                            authenticated = true;
                            deviceType = msg.data.deviceType;
                            this.sockets[id][1] = deviceType;
                            Logger.log(`Device of type ${deviceType} authenticated.`);
                        } else {
                            socket.close();
                        }
                    } else {
                        authenticated = true;
                        deviceType = msg.data.deviceType;
                        this.sockets[id][1] = deviceType;
                        Logger.log(`Device of type ${deviceType} authenticated.`);
                    }
                } else if(msg.type === "auth" && msg.data.deviceType === ConnectionType.LIVE) {
                    // LIVE devices don't need to authenticate since they are a big screen
                    authenticated = true;
                    deviceType = msg.data.deviceType;
                    this.sockets[id][1] = deviceType;
                    Logger.log(`Device of type ${deviceType} authenticated.`);
                }
            }
            
            if(authenticated && deviceType === ConnectionType.CONTROLLER) {
                if(msg.type === "flowers") {
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
                        if(s[0] !== socket && s[1] === ConnectionType.LIVE) {
                            s[0].send(JSON.stringify(msg));
                        }
                    });
                }
                if(msg.type === "match") {
                    /*
                    match: number,
                    teams: {
                        yellow: {
                            teamnumber: string
                        },
                        green: {
                            teamnumber: string
                        }
                    }
                    nextMatch: {
                        yellow: {
                            teamnumber: string
                        },
                        green: {
                            teamnumber: string
                        }
                    }
                    */
                    this.sockets.forEach(s => {
                        if(s[0] !== socket && s[1] === ConnectionType.LIVE) {
                            s[0].send(JSON.stringify(msg));
                        }
                    });
                }
            }
        });

        setTimeout(() => {
            if(deviceType === ConnectionType.UNKNOWN) {
                socket.send(JSON.stringify({ type: "auth", data: { error: "Timed out." }}));
                socket.close();
            }
        }, 5000);
    }
}