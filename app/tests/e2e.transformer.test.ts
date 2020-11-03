import fetch from "node-fetch";
import * as transformerCreateExpected from "../../fixtures/expected/transformer-create.json";
import * as transformerGetExpected from "../../fixtures/expected/transformer-get.json";
import { tansformerBaseUrl, baseUrl } from "../../fixtures/utils/test-utils";

describe("Transformer API tests", () => {
  it("should create a transformer", async () => {
    expect.assertions(3);
    const response = await fetch(tansformerBaseUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test transformer to be deleted",
        transformer: `(body, req, res) => {
              res.statusCode = 418;
              const json = JSON.parse(body);
              json.message = "Newly transformed";
              return JSON.stringify(json);
          }`,
      }),
    });

    const message = await response.json();

    expect(response.status).toBe(201);
    expect(message.name).toBe(transformerCreateExpected.name);
    expect(message.source.replace(/\s/g, "")).toBe(
      transformerCreateExpected.source.replace(/\s/g, "")
    );
  });

  it("should get the transformers", async () => {
    expect.assertions(5);
    const response = await fetch(tansformerBaseUrl, {
      method: "get",
    });

    const message = await response.json();
    /**
     * .length call does not work on imported json modules.
     * Imported modules a key for each member of the array, and a default key.
     * Hence counting the number of keys and then subtracting by one.
     */
    const expectedLength = Object.keys(transformerGetExpected).length - 1;

    expect(message.length).toBe(expectedLength);
    expect(message[0].name).toBe(transformerGetExpected[0].name);
    expect(message[1].name).toBe(transformerGetExpected[1].name);
    expect(message[1].source.replace(/\s/g, "")).toBe(
      transformerGetExpected[1].source.replace(/\s/g, "")
    );
    expect(response.status).toBe(200);
  });

  it("should get the transformed message with transformed status code and message", async () => {
    expect.assertions(2);
    const response = await fetch(baseUrl, {
      method: "get",
    });

    const message = await response.json();
    expect(response.status).toBe(418);
    expect(message).toEqual({ message: "Newly transformed" });
  });

  it("should get a transformer by id and delete it", async () => {
    expect.assertions(3);
    const response = await fetch(tansformerBaseUrl, {
      method: "get",
    });

    expect(response.status).toBe(200);

    const message = await response.json();
    const toDeleteId = message.filter(
      (element: any) => element.name === "Test transformer to be deleted"
    )[0].id;

    const responseById = await fetch(`${tansformerBaseUrl}/${toDeleteId}`, {
      method: "get",
    });

    expect(responseById.status).toBe(200);

    const responseAfterDelete = await fetch(
      `${tansformerBaseUrl}/${toDeleteId}`,
      {
        method: "delete",
      }
    );

    expect(responseAfterDelete.status).toBe(204);
  });

  it("should not get the transformed message with transformed status code and message after transformer is deleted", async () => {
    expect.assertions(2);
    const response = await fetch(baseUrl, {
      method: "get",
    });

    const message = await response.json();
    expect(response.status).toBe(200);
    expect(message).toEqual({ message: "Hello world" });
  });
});
