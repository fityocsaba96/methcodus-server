FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y curl software-properties-common
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get install -y nodejs
RUN add-apt-repository -y ppa:linuxuprising/java
RUN echo oracle-java12-installer shared/accepted-oracle-license-v1-2 select true | debconf-set-selections
RUN apt-get install -y oracle-java12-installer

COPY . /app/

WORKDIR /app
ARG NODE_ENV=development
RUN npm install --unsafe-perm
RUN npm run build
RUN npm prune --production

RUN useradd -m api
USER api

CMD npm start
