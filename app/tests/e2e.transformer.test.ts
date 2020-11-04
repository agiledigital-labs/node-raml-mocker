import fetch from "node-fetch";
import * as transformerCreateExpected from "../../fixtures/expected/transformer-create.json";
import * as transformerGetExpected from "../../fixtures/expected/transformer-get.json";
import { tansformerBaseUrl, baseUrl } from "../../fixtures/utils/test-utils";

const testTransformer = "Test transformer to be deleted";

describe("Transformer API tests", () => {
  it("should create a transformer", async () => {
    expect.assertions(3);

    // When a new transformer is posted
    const response = await fetch(tansformerBaseUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: testTransformer,
        transformer: `(body, req, res) => {
              res.statusCode = 418;
              const json = JSON.parse(body);
              json.message = "Newly transformed";
              return JSON.stringify(json);
          }`,
      }),
    });

    const responseBody = await response.json();

    // Then expect the newly posted transformer to be returned with a status code of 201
    expect(response.status).toBe(201);
    expect(responseBody.name).toBe(transformerCreateExpected.name);
    expect(responseBody.source.replace(/\s/g, "")).toBe(
      transformerCreateExpected.source.replace(/\s/g, "")
    );
  });

  it("should get the transformers", async () => {
    expect.assertions(5);

    // When transformers are requested
    const response = await fetch(tansformerBaseUrl, {
      method: "get",
    });

    const responseBody = await response.json();
    /**
     * .length call does not work on imported json modules.
     * Imported modules a key for each member of the array, and a default key.
     * Hence counting the number of keys and then subtracting by one.
     */
    const expectedLength = Object.keys(transformerGetExpected).length - 1;

    // Then expect all transformers to be returned
    expect(responseBody.length).toBe(expectedLength);
    expect(responseBody[0].name).toBe(transformerGetExpected[0].name);
    expect(responseBody[1].name).toBe(transformerGetExpected[1].name);
    expect(responseBody[1].source.replace(/\s/g, "")).toBe(
      transformerGetExpected[1].source.replace(/\s/g, "")
    );
    expect(response.status).toBe(200);
  });

  it("should get the transformed message with transformed status code", async () => {
    expect.assertions(2);

    // When a get request is sent after creating a new transformer
    const response = await fetch(baseUrl, {
      method: "get",
    });

    const responseBody = await response.json();

    // Then expect the new transformer to modify the message and status code
    expect(response.status).toBe(418);
    expect(responseBody).toEqual({ message: "Newly transformed" });
  });

  it("should get a transformer by id and delete it", async () => {
    expect.assertions(4);

    // Given there are existing transformers
    const response = await fetch(tansformerBaseUrl, {
      method: "get",
    });

    expect(response.status).toBe(200);

    // Get the id of the transformer to be deleted
    const responseBody = await response.json();
    const toDeleteId = responseBody.filter(
      (element: { id: string; name: string; source: string }) =>
        element.name === testTransformer
    )[0].id;

    // When the transformer to be deleted is requested by id
    const responseById = await fetch(`${tansformerBaseUrl}/${toDeleteId}`, {
      method: "get",
    });

    const responseByIdMessage = await responseById.json();

    // Then expect the response to return with our selected transformer
    expect(responseById.status).toBe(200);
    expect(responseByIdMessage.name).toBe(testTransformer);

    // When the transformer is deleted
    const responseAfterDelete = await fetch(
      `${tansformerBaseUrl}/${toDeleteId}`,
      {
        method: "delete",
      }
    );

    // Then expect a 204 resposne
    expect(responseAfterDelete.status).toBe(204);
  });

  it("should not get the transformed message with transformed status code after transformer is deleted", async () => {
    expect.assertions(2);

    // When hello world is requested
    const response = await fetch(baseUrl, {
      method: "get",
    });

    // Then expect the reponse to not be transformed
    const responseBody = await response.json();
    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ message: "Hello world" });
  });
});
