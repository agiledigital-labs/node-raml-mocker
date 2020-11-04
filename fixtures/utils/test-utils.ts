import { transformedTestId as transformerId } from "../transformers/transformer";

export const baseUrl = "http://localhost:5001/helloworld";
export const testId = "test-id-for-raml";
export const transformedTestId = transformerId;
export type HttpMethod = "post" | "put" | "get" | "patch" | "delete";
export const tansformerBaseUrl = "http://localhost:5002/v1/api/transformers";
