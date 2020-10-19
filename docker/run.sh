#!/bin/sh

# Use the Unofficial Bash Strict Mode (Unless You Looove Debugging)
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'


node dist/server.js