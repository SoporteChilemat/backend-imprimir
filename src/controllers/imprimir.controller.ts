import express from "express";
import expressWs from "express-ws";
import type { Router } from "express-ws";
import Imprimir from "../services/imprimir.service";

class ImprimirController {
    private router: Router;
    private service: Imprimir;

    constructor() {
        this.router = expressWs(express()).app as Router;
        this.service = new Imprimir();
        this.registerRoutes();
    }

    private async registerRoutes() {
        this.router.ws("/imprimir", async (ws, req) => {
            ws.on("message", async (msg: any) => {
                console.log(msg);
                const febosID = await this.service.findGuiaFebos(msg);
                console.log(febosID.responseXML);
                await this.service.mandarImprimir(febosID.responseXML);
            })

            ws.on("close", () => {
                console.log("WebSocket connection closed");
            });
        })
    }
    public getController(): Router {
        return this.router;
    }
} export default ImprimirController;
