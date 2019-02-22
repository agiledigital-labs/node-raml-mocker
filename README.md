# RAML first mock server

## Running

Set the following environment variables:
1. RAML_API_FILE - the location of the RAML file to be served by the mock.
2. TRANSFORMERS_DIR (optional) - the location of any transformers that should be applied to the responses.
3. MOCK_PORT (optional, default 5001) - the port that the API will be served through.
4. CONTROL_PORT (optional, default 5002) - the port that the control API (e.g. to reconfigure transformers) will be served through.

Start the server:
```bash
export RAML_API_FILE=[LOCATION OF YOUR RAML FILE]
npm run
```

Check that the control port is reachable:
```bash
curl http://localhost:5002/v1/api/transformers
```

Expect to receive an empty array as the response: [].

Check that the RAML mocks are being served:
```bash
curl http://localhost:5001/[YOUR RAML PATH HERE]
```

Expect to receive an example-based response.

## Adding transformers
### During start-up

Transformers can be configured by setting the `TRANSFORMERS_DIR` environment variable. At startup,  the mock server will process the modules in those directories and add any transformers.

For example:

```javascript
exports.transformers = [
    // A transformer that adds a new property to the response.
    {
        name: 'on behalf of',
        transform: (body, req, res) => {
            const json = JSON.parse(body);
            const user = req.headers['on-behalf-of-customer-id'];
            json.inspectedBy = user;
            return JSON.stringify(json);
        }
    }
];
```

### At run time
Use the control API to add and delete transformers.

For example:

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name": "no-op logger", "transformer": "() => console.log(`heyo`)"}' \
  http://localhost:5002/v1/api/transformers
```

## Transformers
Transformers are `(body, req, res) => body | null`. if a transformer returns `null`, then the original body will be used by the response interceptor. It is possible for a transformer to modify the status and headers of the response using the `res` parameter.