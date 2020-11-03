import fetch from "node-fetch";

type HttpMethod = "post" | "put" | "get" | "patch" | "delete";
const baseUrl = "http://localhost:5001/helloworld";
const testId = "test-id-for-raml";
const transformedTestId = "test-with-transformer";

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

describe("Api tests without transformer", () => {
  it("should get helloworld", async () => {
    const { status, message } = await httpRequest({ method: "get" });

    expect(status).toBe(200);
    expect(message).toBe("Hello world");
  });

  it("should get options for /helloworld", async () => {
    const response = await fetch(baseUrl, {
      method: "options",
    });

    const message = await response.text();

    expect(response.status).toBe(200);
    expect(message).toBe("GET, HEAD, POST");
  });

  it("should get options for /helloworld/{id}", async () => {
    const response = await fetch(`${baseUrl}/${testId}`, {
      method: "options",
    });

    const message = await response.text();

    expect(response.status).toBe(200);
    expect(message).toBe("DELETE, PATCH, PUT");
  });

  it("should be able to call head method for /helloworld and not get any content back", async () => {
    const response = await fetch(baseUrl, {
      method: "head",
    });

    const message = (await response.buffer()).length.toString();

    expect(response.status).toBe(200);
    expect(message).toBe("0");
  });

  it("should post helloworld", async () => {
    const { status, message } = await httpRequest({
      method: "post",
      content: contentBody("post"),
    });

    expect(status).toBe(201);
    expect(message).toBe("Hello world posted");
  });

  it("should put helloworld", async () => {
    const { status, message } = await httpRequest({
      method: "put",
      request: `${baseUrl}/${testId}`,
      content: contentBody("put"),
    });

    expect(status).toBe(200);
    expect(message).toBe("Hello world put");
  });

  it("should patch helloworld", async () => {
    const { status, message } = await httpRequest({
      method: "patch",
      request: `${baseUrl}/${testId}`,
      content: contentBody("patch"),
    });

    expect(status).toBe(200);
    expect(message).toBe("Hello world patch");
  });

  it("should delete helloworld", async () => {
    const { status, message } = await httpRequest({
      method: "delete",
      request: `${baseUrl}/${testId}`,
    });

    expect(status).toBe(204);
    expect(message).toBe("0");
  });
});

describe("Api tests with transformer", () => {
  it("should put helloworld with transformer id and get transformed result", async () => {
    const { status, message } = await httpRequest({
      method: "put",
      request: `${baseUrl}/${transformedTestId}`,
      content: contentBody("put"),
    });

    expect(status).toBe(418);
    expect(message).toBe("Transformed message");
  });

  it("should not be able to transform response message and status code for a 204 response", async () => {
    const { status, message } = await httpRequest({
      method: "delete",
      request: `${baseUrl}/${transformedTestId}`,
    });

    expect(status).toBe(204);
    expect(message).toBe("0");
  });
});
