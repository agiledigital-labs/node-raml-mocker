const express = require('express');
const mung = require('express-mung');
const mockService = require('osprey-mock-service');
const osprey = require('osprey');
const parser = require('raml-1-parser');
const uuidv4 = require('uuid/v4');
const { startApp } = require('./start-app');

exports.ramlmocker = async (port, ramlFile, transformers) => {

    // Initialise the response transformers
    var responseTransformers = transformers ? transformers.map(transformer => {
        return {
            ...transformer,
            id: uuidv4()
        }
    }) : [];

    const remove = (id) => responseTransformers = responseTransformers.filter(t => t.id !== id);

    const add = (transformer) => responseTransformers.push(transformer);

    const get = (id) => responseTransformers.find(transformer => transformer.id === id);

    const list = () => responseTransformers;

    const app = express();

    // Intercept the RAML generated response and hand off to the transformers
    app.use(mung.write((chunk, encoding, request, response) => {

        responseTransformers.forEach(element => {
            console.log(element)
        });

        const matchesPath = transformer => !transformer.path || transformer.path === request.route.path;

        console.log(request.route.path);

        const reducer = (body, transformer) => transformer.transform(body, request, response) || body

        return responseTransformers.filter(matchesPath).reduce(reducer, chunk);    
    }));

    const ramlApi = await parser.loadRAML(ramlFile, {
        rejectOnErrors: true
    });

    var raml = ramlApi.expand(true).toJSON({
        serializeMetadata: false
    });

    app.use(osprey.server(raml));
    app.use(mockService(raml));



    return new Promise((resolve, reject) => {
        startApp(port, app, () => {
            console.log(`RAML mock server running on [${port}].`);
            resolve({
                remove,
                add,
                get,
                list
            });
        });
    });
};