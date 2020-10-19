import * as bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { startApp } from "./start-app";
import { MocksType } from "./types";

export const control = async (port: number, config: MocksType) => {
  const app = express();

  app.use(bodyParser.json());
  app.post("/v1/api/transformers", (req: Request, res: Response) => {
    const body = req.body;
    const id = uuidv4();
    const transformer = {
      id: id,
      transform: Function(`"use strict";return (  ${body.transformer } ")"`)(),
      source: body.transformer,
      path: body.path,
      name: body.name,
    };
    config.add(transformer);
    res.status(201).send(transformer);
  });
  app.get("/v1/api/transformers", (_req: Request, res: Response) => {
    res.status(200).send(config.list());
  });
  app.get("/v1/api/transformers/:id", (req: Request, res: Response) => {
    const postTransformer = config.get(req.params.id);
    postTransformer
      ? res.status(200).send(postTransformer)
      : res.status(404).end();
  });
  app.delete("/v1/api/transformers/:id", (req: Request, res: Response) => {
    config.remove(req.params.id);
    res.status(204).end();
  });

  return new Promise((resolve, _reject) => {
    startApp(port, app, () => {
      console.log(`api mock server running on [${port}].`);
      resolve();
    });
  });
};
