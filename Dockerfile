FROM node:16 As Builder

LABEL maintainer="Agile Digital <info@agiledigital.com.au>"
LABEL description="Docker image that supports a customisable, RAML mock"
LABEL vendor="Agile Digital"
LABEL version="0.1"

ENV HOME /home/runner
ENV RUNNER_USER runner

COPY package.json /home/runner/
COPY yarn.lock /home/runner
COPY tsconfig.json /home/runner
WORKDIR /home/runner
RUN node -v && yarn install --frozen-lockfile 
COPY app/ /home/runner/app/

RUN yarn build

FROM node:16

ENV HOME /home/runner
ENV RUNNER_USER runner

RUN adduser -S -u 10000 -h $HOME runner

WORKDIR /home/runner

COPY --from=builder /home/runner/dist/ ./dist

COPY package.json /home/runner/
COPY yarn.lock /home/runner

RUN node -v && yarn install --frozen-lockfile --prod

COPY docker/run.sh /home/runner/run.sh


RUN chmod +x /home/runner/run.sh

RUN chgrp -Rf root /home/runner && chmod -Rf g+w /home/runner

ENV RAML_API_FILE=/home/runner/artifacts/api/api.raml
ENV TRANSFORMERS_DIR=/home/runner/artifacts/transformers

EXPOSE 5001
EXPOSE 5002

USER runner

ENTRYPOINT [ "/home/runner/run.sh" ]