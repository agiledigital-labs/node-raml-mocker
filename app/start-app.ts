import { readFileSync } from "fs";
import { createServer, RequestListener } from "http";
import { createServer as secureCreateServer } from "https";

const tlsPublicCertificatePath = process.env.TLS_PUBLIC_CERTIFICATE_PATH;
const tlsPrivateKeyPath = process.env.TLS_PRIVATE_KEY_PATH;
const tlsRootCaCertificatePath = process.env.TLS_CA_CERTIFICATE_PATH;

/**
 * To start the app securely if security related files are defined.
 * If not start it without any additional security settings.
 * @param port port through which the app would run
 * @param app the application to run
 * @param callback to be executed on callback
 */
export const startApp = (
  port: number,
  app: RequestListener | undefined,
  callback: () => void
) => {
  const server =
    tlsPublicCertificatePath !== undefined &&
    tlsPrivateKeyPath !== undefined &&
    tlsRootCaCertificatePath !== undefined
      ? secureCreateServer(
          {
            cert: readFileSync(tlsPublicCertificatePath),
            key: readFileSync(tlsPrivateKeyPath),
            ca: readFileSync(tlsRootCaCertificatePath),
          },
          app
        )
      : createServer(app);
  server.listen(port, callback);
};

export default startApp;
