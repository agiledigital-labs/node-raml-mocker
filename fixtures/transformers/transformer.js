import { transformedTestId } from "../utils/test-utils";
exports.transformers = [
  {
    name: "Test transformations with transfromer test id",
    transform: (body, req, res) => {
      console.log("Resource Path", req.method, req.url);

      if (req.url === `/helloworld/${transformedTestId}`) {
        res.statusCode = 418;
        let json = JSON.parse(body);
        json.message = "Transformed message";
        return JSON.stringify(json);
      }

      return;
    },
  },
];
