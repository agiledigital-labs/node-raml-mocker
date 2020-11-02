exports.transformers = [
  {
    name: "Test transformations with transfromer test id",
    transform: (body, req, res) => {
      console.log("Resource Path", req.method, req.url);
      console.log(req.url);
      const transformedTestId = "test-with-transformer";

      if (req.url === `/helloworld/${transformedTestId}`) {
        console.log("resource path has matched");
        res.statusCode = 418;
        const json = JSON.parse(body);
        json.message = "Transformed message";
        return JSON.stringify(json);
      }

      return;
    },
  },
];
