import { Configuration } from "./config";
import { WebSocketServer } from "./ws/ws";
import { WebServer } from "./webserver/webserver";
import { Logger } from "./logger";
import express, { Express } from "express";

import * as http from "http";
import * as https from "https";
import * as fs from "fs";


const app: Express = express();
const server: http.Server | https.Server = Configuration.ssl ? https.createServer({ key: fs.readFileSync(Configuration.sslKeyLoc), cert: fs.readFileSync(Configuration.sslCertLoc) }, app) : http.createServer(app);

const ws: WebSocketServer = new WebSocketServer(server);
ws.setup();

const webserver: WebServer = new WebServer(app);
webserver.setup();

server.listen(Configuration.port, () => {
    Logger.log(`Server started on port ${Configuration.port}`);
});