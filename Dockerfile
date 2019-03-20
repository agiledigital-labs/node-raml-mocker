FROM node:8.11.1-alpine

LABEL maintainer="Agile Digital <info@agiledigital.com.au>"
LABEL description="Docker image that supports a customisable, RAML mock"
LABEL vendor="Agile Digital"
LABEL version="0.1"

RUN apk add git=2.13.7-r2 --no-cache

ENV HOME /home/runner
ENV RUNNER_USER runner

RUN adduser -S -u 10000 -h $HOME runner

# We need to support Openshift's random userid's
# Openshift leaves the group as root. Exploit this to ensure we can always write to them
# Ensure we are in the the passwd file
COPY package.json /home/runner/
COPY package-lock.json /home/runner
WORKDIR /home/runner
RUN npm install
COPY app/* /home/runner/app/

COPY docker/run.sh /home/runner/app/run.sh

RUN chmod +x /home/runner/app/run.sh

RUN chmod g+w /etc/passwd
RUN chgrp -Rf root /home/runner && chmod -Rf g+w /home/runner

ENV RAML_API_FILE=/home/runner/artifacts/api/api.raml
ENV TRANSFORMERS_DIR=/home/runner/artifacts/transformers

EXPOSE 5001
EXPOSE 5002

USER runner

ENTRYPOINT [ "/home/runner/app/run.sh" ]