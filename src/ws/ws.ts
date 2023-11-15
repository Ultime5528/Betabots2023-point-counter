import { Configuration } from "../config";
import { Logger } from "../logger";
import { Server, Socket } from "socket.io";
import * as https from "https";
import * as http from "http";


export class WebSocketServer {
    port: number;
    ssl: boolean;
    sslKeyLoc: string;
    sslCertLoc: string;
    server: http.Server | https.Server;
    io: Server;
    sockets: Socket[];

    constructor(server: http.Server | https.Server) {
        this.port = Configuration.port;
        this.ssl = Configuration.ssl;
        this.sslKeyLoc = Configuration.sslKeyLoc;
        this.sslCertLoc = Configuration.sslCertLoc;
        this.server = server;
        this.io = null;
        this.sockets = [];
    }

    setup(): void {
        Logger.log('Setting up WebSocket server...');
        this.io = new Server(this.server);
        this.io.on('connection', this.onConnection);
        this.io.on('disconnect', this.onDisconnect);
    }

    onDisconnect(socket: Socket) {
        this.sockets = this.sockets.filter(s => s !== socket);
    }

    onConnection(socket: Socket) {
        this.sockets.push(socket);

        socket.on('message', (msg: string) => {
            Logger.log(`Received message: ${msg}`);
            this.io.emit('message', msg);
        });
    }

    start(): void {
        Logger.log('Starting WebSocket server...');
    }
}