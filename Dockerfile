FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y curl software-properties-common
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs
RUN curl -sL https://adoptopenjdk.jfrog.io/adoptopenjdk/api/gpg/key/public | apt-key add
RUN add-apt-repository -y https://adoptopenjdk.jfrog.io/adoptopenjdk/deb/
RUN apt-get install -y adoptopenjdk-14-hotspot

RUN useradd -m server
USER server

COPY --chown=server . /app/

WORKDIR /app
ARG NODE_ENV=development
RUN npm install
RUN npm run build
RUN npm prune --production

CMD NODE_ENV=production npm start
