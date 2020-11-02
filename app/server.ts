import { existsSync } from "fs";
import { control } from "./control-api";
import { ramlmocker } from "./ramlmocker";
import type { Transformer } from "./types";

export const mockRaml = async () => {
  const ramlFile = process.env.RAML_API_FILE;

  const transformersDir = process.env.TRANSFORMERS_DIR;

  const mockPort = parseInt(process.env.MOCK_PORT || "5001", 10);

  const controlPort = parseInt(process.env.CONTROL_PORT || "5002", 10);

  if (!ramlFile || !existsSync(ramlFile)) {
    throw `RAML file location [${ramlFile}] does not exist, is RAML_API_FILE set correctly?`;
  }

  const transformerModules =
    transformersDir && existsSync(transformersDir)
      ? // TODO: This without using require
        require("require-all")({
          dirname: transformersDir,
          excludeDirs: /^\.(git|svn)$/,
        })
      : {};

  const moduleNames = Object.keys(transformerModules);

  console.log("Loading transformers from modules:");
  if (moduleNames.length === 0) {
    console.log("(none)");
  }
  moduleNames.forEach((key) => console.log(`\t${key}`));

  const transformers = moduleNames.reduce(
    (acc, key) => acc.concat(transformerModules[key].transformers),
    []
  );

  const mocks = await ramlmocker(
    mockPort,
    ramlFile,
    transformers
  ).catch((e: unknown) => console.error(`Error generating mocks: ${e}`));

  if (!mocks) {
    return;
  }

  await control(controlPort, mocks).catch((e: unknown) =>
    console.error(`Error generating mocks: ${e}`)
  );

  console.log("Configured transformers:");
  if (mocks.list().length === 0) {
    console.log("(none)");
  }
  mocks
    .list()
    .forEach((transformer: Transformer) =>
      console.log(
        `\t${transformer.id}\t${transformer.name}\t${transformer.path}\t${transformer.source}`
      )
    );
};

mockRaml().catch((e: unknown) => console.error(`Error generating mocks: ${e}`));
