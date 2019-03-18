#!/bin/bash
#
# For someone who has a local version of "platform-aws" set up
# this script will do the following things:
#
# 1. Upload the archive to your artifacts bucket
# 2. Template a Kubernetes deployment file to deploy the artifact
# 3. Apply the deployment file to your Kubernetes cluster using kubectl

# Bash strict mode. See http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
set -x
IFS=$'\n\t'

usage() { 
    echo "Usage: $0 NAME PACKAGE_PATH" 1>&2; exit 1; 
}

SCRIPT_LOCATION="${BASH_SOURCE%/*}"
PROJECT_DIR="${SCRIPT_LOCATION}/.."

NAME=${1:-}
if [ -z "$NAME" ]; then
    usage
fi

PACKAGE_PATH=${2:-}

if [ -z "$PACKAGE_PATH" ]; then
    usage
fi


function fail() {
  tput setaf 1; echo "Failure: $*" && tput sgr0
  exit 1
}

function info() {
  tput setaf 6; echo "$*" && tput sgr0
}

function success() {
  tput setaf 2; echo "$*" && tput sgr0
}

function get_stage() {
  if [ -z "${STAGE-}" ]
  then
    read -p 'Enter your stage name [dev]: ' STAGE
  fi
  if [ -z "${STAGE-}" ]
  then
    STAGE='dev'
  fi
  export STAGE
}

function upload_archive() {
  info "checking for package"

  if [ ! -f "${PACKAGE_PATH}" ]; then
     fail "package does not exist at [${PACKAGE_PATH}]"
  fi

  DESTINATION="s3://platform-aws-base-${STAGE}-artifacts/${NAME//_/-}/mock/release-${STAGE}-local"

  aws s3 cp "${PACKAGE_PATH}" "${DESTINATION}/"

  export DESTINATION
}

function template_k8_deployment() {
  info "templating kubernetes deployment"
  AWS_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)
  ENVIRONMENT="${STAGE}"
  BUILD_NUMBER="local"
  NAME=${NAME//_/-}
  export AWS_ACCOUNT
  export ENVIRONMENT
  export BUILD_NUMBER
  export NAME
  
  rm -f "${SCRIPT_LOCATION}/deploy.yml"
  envsubst < "${SCRIPT_LOCATION}/deploy.template.yml" > "${SCRIPT_LOCATION}/deploy.yml"
}

function apply_k8_deployment() {
  info "sanity checking kubectl"
  kubectl get namespace "csc-${STAGE}"
  info "applying deployment"
  kubectl apply -n "csc-${STAGE}" -f "${SCRIPT_LOCATION}/deploy.yml"
  info "checking status"
  kubectl rollout -n "csc-${STAGE}" status deploy system-master-index-mock
}

get_stage
upload_archive
template_k8_deployment
apply_k8_deployment