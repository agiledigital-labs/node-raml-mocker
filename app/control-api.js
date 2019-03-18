const express = require('express');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');

exports.control = async (port, config) => {

    const app = express();

    app.use(bodyParser.json());
    app.post('/v1/api/transformers', (req, res, next) => {
        const body = req.body;
        const id = uuidv4();
        const transformer = {
            id: id,
            transform: Function('"use strict";return (' + body.transformer + ')')(),
            source: body.transformer,
            path: body.path,
            name: body.name
        };
        config.add(transformer);
        res.status(201).send(transformer);
    });
    app.get('/v1/api/transformers', (req, res, next) => {
        res.status(200).send(config.list());
    });
    app.get('/v1/api/transformers/:id', (req, res, next) => {
        const postTransformer = config.get(req.params.id);
        postTransformer ? res.status(200).send(postTransformer) : res.status(404).end();
    });
    app.delete('/v1/api/transformers/:id', (req, res, next) => {
        config.remove(req.params.id);
        res.status(204).end();
    });

    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`api mock server running on [${port}].`)
            resolve(server);
        })
    });

};