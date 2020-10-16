import { Request, Response } from "express";

export type Transform = (body: string, req: Request, res: Response) => string;

export type Transformer = {
  name: string;
  id: string;
  path: string;
  transform: Transform;
  source: string;
};


export type MocksType = {
  remove: (id: string) => Array<Transformer>;
  add: (transformer: Transformer) => number;
  get: (id: string) => Transformer | undefined;
  list: () => Array<Transformer>;
};