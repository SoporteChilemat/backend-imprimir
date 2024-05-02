import express from "express";
import ImprimirController from './imprimir.controller';


const routerApi = (app: any) => {
  const router = express.Router();
  const imprimirController = new ImprimirController();

  app.use("/api/v1", router);

  router.use("/imprimir", imprimirController.getController());
};

export default routerApi;
