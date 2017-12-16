#FROM node:9.2.0-stretch
FROM ubuntu:16.04
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .