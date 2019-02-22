const rp = require('request-promise-native');
const assert = require('assert');
const {
    ramlmocker
} = require('./ramlmock-api');
const {
    control
} = require('./control-api')
const fs = require('fs');

const test = async () => {

    const ramlFile = process.env.RAML_API_FILE;

    const transformersDir = process.env.TRANSFORMERS_DIR;

    const mockPort = process.env.MOCK_PORT || 5001;

    const controlPort = process.env.CONTROL_PORT || 5002;

    if (!ramlFile || !fs.existsSync(ramlFile)) {
        throw `RAML file location [${ramlFile}] does not exist, is RAML_API_FILE set correctly?`;
    }

    const transformerModules = (transformersDir && fs.existsSync(transformersDir)) ?
        require('require-all')({
            dirname: transformersDir,
            excludeDirs: /^\.(git|svn)$/
        }) : {}

    const moduleNames = Object.keys(transformerModules);

    console.log("Loading transformers from modules:");
    if (moduleNames.length == 0) {
        console.log('(none)');
    }
    moduleNames.forEach(key => console.log(`\t${key}`));

    const transformers = moduleNames.reduce((acc, key) => acc.concat(transformerModules[key].transformers), []);

    const mocks = await ramlmocker(mockPort, ramlFile, transformers);

    const controlServer = await control(controlPort, mocks);

    console.log('Configured transformers:');
    if (mocks.list().length == 0) {
        console.log('(none)');
    }
    mocks.list().forEach(transformer => console.log(`\t${transformer.id}\t${transformer.name}\t${transformer.path}\t${transformer.source}`));
}

test();