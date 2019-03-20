#!/bin/bash
#
# Packages RAML and (optionally) transformers in the package format
# expected by the node-raml-mocker.
# The file written by this script can be uploaded by the upload-artifact-local.sh
# script.

# Use the Unofficial Bash Strict Mode (Unless You Looove Debugging)
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

set -x

usage() {
    echo "Usage: $0 OUTPUT RAML_DIR [TRANFORMERS_DIR]" 1>&2; exit 1;
}

OUTPUT=${1:-}
if [ -z "$OUTPUT" ]; then
    usage
fi

if [[ -e "${OUTPUT}" ]]; then
    echo "Output [${OUTPUT}] exists."
    usage
    exit 1
fi

RAML=${2:-}

if [ -z "$RAML" ]; then
    usage
fi

if [[ ! -d ${RAML} ]]; then
    echo "RAML directory [${RAML}] does not exist!"
    usage
    exit 1
fi

if [[ ! -f ${RAML}/api.raml ]]; then
    echo "RAML api.raml [${RAML}/api.raml] does not exist!"
    usage
    exit 1
fi

TRANSFORMERS_DIR=${3:-}

if [ ! -z "$TRANSFORMERS_DIR" ]; then
  if [[ ! -d ${TRANSFORMERS_DIR} ]]; then
    echo "Transformers directory [${TRANSFORMERS_DIR}] does not exist!"
    usage
    exit 1
  fi
fi

TMPDIR=$(mktemp -d)

# Make sure it gets removed even if the script exits abnormally.
trap "exit 1"         HUP INT PIPE QUIT TERM
trap 'rm -rf "$TMPDIR"' EXIT

mkdir "${TMPDIR}/api"
mkdir "${TMPDIR}/transformers"
cp -r "${RAML}"/* "${TMPDIR}/api"

if [ ! -z "$TRANSFORMERS_DIR" ]; then
  cp -r "${TRANSFORMERS_DIR}"/* "${TMPDIR}/transformers"
fi

tar -czvf "${OUTPUT}" -C "${TMPDIR}" .