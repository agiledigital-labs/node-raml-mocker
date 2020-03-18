#!/bin/sh

# Use the Unofficial Bash Strict Mode (Unless You Looove Debugging)
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -eu pipefail
IFS=$'\n\t'

# Ensure that assigned uid has entry in /etc/passwd.
if [ `id -u` -ge 10000 ]; then
    echo "Patching /etc/passwd to make ${RUNNER_USER} -> builder and `id -u` -> ${RUNNER_USER}"
    cat /etc/passwd | sed -e "s/${RUNNER_USER}/builder/g" > /tmp/passwd
    echo "${RUNNER_USER}:x:`id -u`:`id -g`:,,,:/home/${RUNNER_USER}:/bin/bash" >> /tmp/passwd
    cat /tmp/passwd > /etc/passwd
    rm /tmp/passwd
fi

node app/server.js