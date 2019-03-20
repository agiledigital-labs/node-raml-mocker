const http = require('http');
const https = require('https');
const fs = require('fs');


const tlsPublicCertificatePath = process.env.TLS_PUBLIC_CERTIFICATE_PATH;
const tlsPrivateKeyPath = process.env.TLS_PRIVATE_KEY_PATH;
const tlsRootCaCertificatePath = process.env.TLS_CA_CERTIFICATE_PATH;

exports.startApp = (port, app, callback) => {
    const server = (tlsPublicCertificatePath !== undefined &&
            tlsPrivateKeyPath !== undefined &&
            tlsRootCaCertificatePath !== undefined) ?
        https.createServer({
            cert: fs.readFileSync(tlsPublicCertificatePath),
            key: fs.readFileSync(tlsPrivateKeyPath),
            ca: fs.readFileSync(tlsRootCaCertificatePath),
        }, app) : http.createServer(app);
    server.listen(port, callback);
}