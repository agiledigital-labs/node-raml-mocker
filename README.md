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
yarn start
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

Transformers can be configured by setting the `TRANSFORMERS_DIR` environment variable. At startup, the mock server will process the modules in those directories and add any transformers.

For example:

```javascript
exports.transformers = [
  // A transformer that adds a new property to the response.
  {
    name: "on behalf of",
    transform: (body, req, res) => {
      const json = JSON.parse(body);
      const user = req.headers["on-behalf-of-customer-id"];
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

## Deploying

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: transformers
data:
  transformers.js: |
    exports.transformers = [];
---
apiVersion: v1
kind: Service
metadata:
  annotations:
  name: node-mock-runner
spec:
  selector:
    app: node-mock-runner
    component: mock
  ports:
    - name: https
      port: 5001
      targetPort: 5001
      protocol: TCP
    - name: control-port
      port: 5002
      targetPort: 5002
      protocol: TCP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  annotations:
    createdInBuild: "19"
    environment: "dev"
  name: node-mock-runner
  labels:
    app: node-mock-runner
spec:
  replicas: 1
  progressDeadlineSeconds: 300
  selector:
    matchLabels:
      app: node-mock-runner
  template:
    metadata:
      labels:
        app: node-mock-runner
        component: mock
    spec:
      initContainers:
        - image: alpine/git
          name: git
          imagePullPolicy: IfNotPresent
          args:
            - clone
            - https://$(TOKEN_OWNER):$(TOKEN)@some.git
            - /home/runner/artifacts
          env:
            - name: TOKEN
              value: test
            - name: TOKEN_OWNER
              value: other
          volumeMounts:
            - name: artifacts
              mountPath: /home/runner/artifacts
      containers:
        - image: node-mock-runner
          name: node-mock-runner
          imagePullPolicy: Always
          env:
            - name: MOCK_PORT
              value: "8081"
            - name: TRANSFORMERS_DIR
              value: "/home/runner/artifacts/transformers"
            - name: ENVIRONMENT
              value: "dev"
            - name: RAML_API_FILE
              value: "/home/runner/artifacts/api.raml"
            - name: TLS_PUBLIC_CERTIFICATE_PATH
              value: /home/runner/certs/tls-certificate.cert.pem
            - name: TLS_PRIVATE_KEY_PATH
              value: /home/runner/certs/tls-certificate.privkey.pem
            - name: TLS_CA_CERTIFICATE_PATH
              value: /home/runner/certs/tls-certificate-rootCA.cert.pem
          ports:
            - containerPort: 5001
              name: https
            - containerPort: 5002
              name: control-port

          volumeMounts:
            - name: transformers
              mountPath: /home/runner/artifacts/transformers/transformers.js
              subPath: transformers.js
              readOnly: true
            - name: tls-certificate
              mountPath: /home/runner/certs/tls-certificate.cert.pem
              subPath: tls-certificate.cert.pem
              readOnly: true
            - name: tls-root-cert
              mountPath: /home/runner/certs/tls-certificate-rootCA.cert.pem
              subPath: tls-certificate-rootCA.cert.pem
              readOnly: true
            - name: tls-private-key
              mountPath: /home/runner/certs/tls-certificate.privkey.pem
              subPath: tls-certificate.privkey.pem
              readOnly: true
          resources:
            requests:
              memory: 128Mi
          readinessProbe:
            tcpSocket:
              port: 5001
            initialDelaySeconds: 5
            periodSeconds: 10
      volumes:
        - name: transformers
          configMap:
            name: transformers
        - name: tls-certificate
          secret:
            secretName: tls-certificate
        - name: tls-root-cert
          secret:
            secretName: tls-root-cert
        - name: tls-private-key
          secret:
            secretName: tls-private-key

```
## TLS

To enable TLS/HTTPS, specify the following environment variables:

- TLS_PUBLIC_CERTIFICATE_PATH
- TLS_PRIVATE_KEY_PATH
- TLS_CA_CERTIFICATE_PATH


