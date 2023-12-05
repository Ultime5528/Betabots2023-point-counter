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

    lastFlowers: any;
    lastMatch: any;
    lastTeams: any;

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

        const syncData = () => {
            if(this.lastFlowers) {
                socket.send(JSON.stringify(this.lastFlowers));
            }
            if(this.lastMatch) {
                socket.send(JSON.stringify(this.lastMatch));
            }
            if(this.lastTeams) {
                socket.send(JSON.stringify(this.lastTeams));
            }
        }

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
                            syncData();
                        } else {
                            socket.close();
                        }
                    } else {
                        authenticated = true;
                        deviceType = msg.data.deviceType;
                        this.sockets[id][1] = deviceType;
                        Logger.log(`Device of type ${deviceType} authenticated.`);
                        syncData();
                    }
                } else if(msg.type === "auth" && msg.data.deviceType === ConnectionType.LIVE) {
                    // LIVE devices don't need to authenticate since they are a big screen and thus dont control any data
                    authenticated = true;
                    deviceType = msg.data.deviceType;
                    this.sockets[id][1] = deviceType;
                    Logger.log(`Device of type ${deviceType} authenticated.`);
                    syncData();
                }
            }
            
            if(authenticated && deviceType === ConnectionType.CONTROLLER) {
                if(msg.type === "flowers") {
                    /*
                    flowers_obj: [

                    ],
                    points: {
                        blue: number,
                        red: number
                    }
                    flowers: {
                        blue: number,
                        red: number
                    }
                    */
                    this.sockets.forEach(s => {
                        if(s[0] !== socket) {
                            s[0].send(JSON.stringify(msg));
                        }
                    });
                    this.lastFlowers = msg;
                }
                if(msg.type === "match") {
                    /*
                    match: number
                    
                    */
                    this.sockets.forEach(s => {
                        if(s[0] !== socket) {
                            s[0].send(JSON.stringify(msg));
                        }
                    });
                    this.lastMatch = msg;
                }
                if(msg.type === "teams") {
                    /*teams: {
                        red: {
                            teamnumber: string
                        },
                        blue: {
                            teamnumber: string
                        }
                    }*/
                    this.sockets.forEach(s => {
                        if(s[0] !== socket) {
                            s[0].send(JSON.stringify(msg));
                        }
                    });
                    this.lastTeams = msg;
                }
            }
        });
    }
}