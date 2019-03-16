# Creating a new mock

## Package the RAML and transformers
```bash
.agile-cicd/generate-mock.sh /tmp/system-master-index-mock.tar.gz  ~/service-layer/raml-system-master-index ~/dev/agile/node-raml-mocker/app/samples/transformers
```

## Create the deployment
```bash
.agile-cicd/upload-artifact-local.sh system_master_index_mock /tmp/system-master-index-mock.tar.gz
```

If deploying to a local cluster, the commented section in the init container must be uncommented and the
AWS credentials supplied.