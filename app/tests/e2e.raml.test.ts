import fetch from "node-fetch";
import {
  HttpMethod,
  baseUrl,
  testId,
  transformedTestId,
} from "../../fixtures/utils/test-utils";

const contentBody = (method: HttpMethod) =>
  JSON.stringify({ message: `Hello world ${method}` });

const httpRequest = async <T extends { message: string }>({
  method,
  content,
  request = baseUrl,
}: {
  method: HttpMethod;
  content?: string;
  request?: string;
}): Promise<{ status: number; message?: T["message"] }> => {
  const response = await fetch(request, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: content,
  });

  const body =
    response.status === 204
      ? (await response.buffer()).length.toString()
      : (<T>await response.json()).message;

  return { status: response.status, message: body };
};

describe("Api tests ", () => {
  it("should get helloworld", async () => {
    expect.assertions(2);

    // When the mocked endpoint is sent a get request
    const { status, message } = await httpRequest({ method: "get" });

    // Then get the message with 200 status code
    expect(status).toBe(200);
    expect(message).toBe("Hello world");
  });

  it("should get options for /helloworld", async () => {
    // Given these are the methods for the endpoint
    const testMethods = ["GET", "HEAD", "POST"];
    expect.assertions(1 + testMethods.length);

    // When the mocked endpoint is asked for options
    const response = await fetch(baseUrl, {
      method: "options",
    });

    // Then expect the options in allow header
    expect(response.status).toBe(200);
    testMethods.forEach((value) =>
      expect(response.headers.get("Allow")).toEqual(
        expect.stringContaining(value)
      )
    );
  });

  it("should get options for /helloworld/{id}", async () => {
    // Given these are the methods for the endpoint
    const testMethods = ["DELETE, PATCH, PUT"];
    expect.assertions(1 + testMethods.length);

    // When the mocked endpoint is asked for options
    const response = await fetch(`${baseUrl}/${testId}`, {
      method: "options",
    });

    // Then expect the options in allow header
    expect(response.status).toBe(200);
    testMethods.forEach((value) =>
      expect(response.headers.get("Allow")).toEqual(
        expect.stringContaining(value)
      )
    );
  });

  it("should be able to call head method for /helloworld and not get any content back", async () => {
    expect.assertions(2);

    // When a head request is sent to the endpoint
    const response = await fetch(baseUrl, {
      method: "head",
    });

    const message = (await response.buffer()).length.toString();

    // Then expect the response with 200 status code and a response of 0 length (no body)
    expect(response.status).toBe(200);
    expect(message).toBe("0");
  });

  it("should post helloworld", async () => {
    expect.assertions(2);

    // When a new hello world is posted
    const { status, message } = await httpRequest({
      method: "post",
      content: contentBody("post"),
    });

    // Then expect a 201 with the posted response
    expect(status).toBe(201);
    expect(message).toBe("Hello world post");
  });

  it("should put helloworld", async () => {
    expect.assertions(2);

    // When a hello world is modified
    const { status, message } = await httpRequest({
      method: "put",
      request: `${baseUrl}/${testId}`,
      content: contentBody("put"),
    });

    // Then expect the modified body to be returned
    expect(status).toBe(200);
    expect(message).toBe("Hello world put");
  });

  it("should patch helloworld", async () => {
    expect.assertions(2);

    // when a hello world is partially modified
    const { status, message } = await httpRequest({
      method: "patch",
      request: `${baseUrl}/${testId}`,
      content: contentBody("patch"),
    });

    // Then expect the partially modified body to be returned
    expect(status).toBe(200);
    expect(message).toBe("Hello world patch");
  });

  it("should delete helloworld", async () => {
    expect.assertions(2);

    // When a hello world is deleted
    const { status, message } = await httpRequest({
      method: "delete",
      request: `${baseUrl}/${testId}`,
    });

    // Then expect a response with no body and a status code of 204
    expect(status).toBe(204);
    expect(message).toBe("0");
  });
});

describe("Transformed api tests", () => {
  it("should make a put request and get transformed result", async () => {
    expect.assertions(2);

    // When the transformed endpoint is queried
    const { status, message } = await httpRequest({
      method: "put",
      request: `${baseUrl}/${transformedTestId}`,
      content: contentBody("put"),
    });

    // Then expect the transformed message and status code to be served
    expect(status).toBe(418);
    expect(message).toBe("Transformed message");
  });

  it("should not be able to transform response message and status code for a 204 response", async () => {
    expect.assertions(2);

    // When a hello world is deleted
    const { status, message } = await httpRequest({
      method: "delete",
      request: `${baseUrl}/${transformedTestId}`,
    });

    // Then expect the transformer to not modify the message or status code for a 204 response
    expect(status).toBe(204);
    expect(message).toBe("0");
  });
});
