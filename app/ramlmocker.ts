import express, { Request, Response } from "express";
import { write } from "express-mung";
import osprey from "osprey";
import mockService from "osprey-mock-service";
import { v4 as uuidv4 } from "uuid";
import { startApp } from "./start-app";
import type { MocksType, Transformer } from "./types";
import fs from "fs";
import { WebApiParser } from "webapi-parser";

async function createModel(ramlFile: string) {
  const ramlString = fs.readFileSync(ramlFile).toString();
  const createdModel10 = await WebApiParser.raml10
    .parse(ramlString)
    .catch((e: unknown) => console.error(`Error generating mocks: ${e}`));

  return createdModel10;
}

export const ramlmocker = async (
  port: number,
  ramlFile: string,
  transformers: Array<Transformer>
): Promise<MocksType> => {
  // Initialise the response transformers
  // TODO: This without using a Var
  var responseTransformers: Array<Transformer> = transformers
    ? transformers.map((transformer) => {
        return {
          ...transformer,
          id: uuidv4(),
        };
      })
    : [];

  const remove = (id: string): Array<Transformer> =>
    (responseTransformers = responseTransformers.filter((t) => t.id !== id));

  const add = (transformer: Transformer): number =>
    responseTransformers.push(transformer);

  const get = (id: string): Transformer | undefined =>
    responseTransformers.find(
      (transformer: Transformer) => transformer.id === id
    );

  const list = () => responseTransformers;

  const app = express();

  // Intercept the RAML generated response and hand off to the transformers
  app.use(
    write(
      (
        chunk: string | Buffer,
        _encoding: string | null,
        request: Request,
        response: Response
      ): string | Buffer => {
        responseTransformers.forEach((element) => {
          console.log(element);
        });

        const matchesPath = (transformer: Transformer) =>
          !transformer.path || transformer.path === request.route.path;

        console.log(request.route.path);

        const reducer = (body: string | Buffer, transformer: Transformer) =>
          transformer.transform(body.toString(), request, response) || body;

        return responseTransformers.filter(matchesPath).reduce(reducer, chunk);
      }
    )
  );

  const raml = await createModel(ramlFile).catch((e: unknown) =>
    console.error(`Error generating mocks: ${e}`)
  );

  app.use(osprey.server(raml, { RAMLVersion: undefined }));
  app.use(mockService(raml));

  return new Promise((resolve, _reject) => {
    startApp(port, app, () => {
      console.log(`RAML mock server running on [${port}].`);
      resolve({
        remove,
        add,
        get,
        list,
      });
    });
  });
};
