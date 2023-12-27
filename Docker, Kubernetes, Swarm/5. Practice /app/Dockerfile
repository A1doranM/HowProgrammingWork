FROM node:21-alpine as base

RUN apk add --no-cache --upgrade bash curl;

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8000

CMD node index.js
