import express from "express";
import expressWs from "express-ws";
import type { Router } from "express-ws";
import Imprimir from "../services/imprimir.service";
import * as reimprimirService from "../services/reimprimir.service";

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
                const febosID = await this.service.findGuiaFebos(msg);
                if (febosID.responseXML !== null) {
                    const result = await this.service.mandarImprimir(febosID.responseXML);

                    if (result) {
                        const response = await reimprimirService.actualizarEstadoGuia(parseInt(msg), 1);

                        // Si response es undefined, null, o si no tiene propiedades, puedes considerarlo como fallido
                        if (!response || Object.keys(response).length === 0) {
                            ws.send('error al atualizar');
                        }

                        // Si la actualización fue exitosa, enviar 'successful'
                        ws.send('successful');
                    } else {
                        ws.send('Error');
                    }
                } else {
                    ws.send('Error');
                }
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
