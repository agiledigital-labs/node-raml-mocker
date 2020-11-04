exports.transformedTestId = "test-with-transformer";

exports.transformers = [
  {
    name: "Test transformations with transfromer test id",
    transform: (body, req, res) => {
      console.log("Resource Path", req.method, req.url);
      const transformedTestId = "test-with-transformer";

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
