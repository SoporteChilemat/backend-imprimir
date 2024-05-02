import express, { Application } from "express";
import expressWs from "express-ws";

import Api from "./controllers/"; // Asegúrese de que la ruta es correcta y de que está adaptada para WebSockets.
import config from './config';

const PORT = config.port;
const expressApp: Application = express();
const { app } = expressWs(expressApp);

// Aquí puedes añadir middleware específico para WebSockets si es necesario.
// No se incluye cors ni el manejo de JSON porque no son esenciales para WebSockets.

Api(app); // Asegúrate de que tu módulo Api esté correctamente configurado para manejar WebSockets.

app.listen(PORT, () => {
  console.log(`WebSocket server is running on http://localhost:${PORT}`);
});
