import express, { Request, Response } from "express";
import { write } from "express-mung";
import osprey from "osprey";
import mockService from "osprey-mock-service";
import { loadRAML } from "raml-1-parser";
import { v4 as uuidv4 } from "uuid";
import { startApp } from "./start-app";
import { MocksType, Transformer } from "./types";

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

  const ramlApi = await loadRAML(ramlFile, [], {
    rejectOnErrors: true,
  });

  // @ts-ignore
  const raml = ramlApi.expand(true).toJSON({
    serializeMetadata: false,
  });

  app.use(osprey.server(raml, { RAMLVersion: undefined }));
  app.use(mockService(raml));

  return new Promise((resolve, reject) => {
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
