import { Configuration } from "../config";
import * as express from "express";
import { Express } from "express";
import { Logger } from "../logger";

export class WebServer {
    port: number;
    ssl: boolean;
    sslKeyLoc: string;
    sslCertLoc: string;
    app: Express;

    constructor(app: Express) {
        this.port = Configuration.port;
        this.ssl = Configuration.ssl;
        this.sslKeyLoc = Configuration.sslKeyLoc;
        this.sslCertLoc = Configuration.sslCertLoc;
        this.app = app;
    }

    setup(): void {
        Logger.log("Setting up WebServer...");
        this.app.use(express.static('www'));
    }
}