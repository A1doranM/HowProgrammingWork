"use strict";

// Сервер который мы будем тестировать, этот код взят из урока про создание АПИ на Ноде.

const http = require("http");
const path = require("path");
const fs = require("fs").promises;
const { Scheduler } = require("./scheduler.js");

global.scheduler = new Scheduler();
const api = new Map();

const apiPath = "./api/";

const cacheFile = (name) => {
  const filePath = apiPath + name;
  const key = path.basename(filePath, ".js");
  try {
    const libPath = require.resolve(filePath);
    delete require.cache[libPath];
  } catch (e) {
    return;
  }
  try {
    const method = require(filePath);
    api.set(key, method);
  } catch (e) {
    api.delete(name);
  }
};

const cacheFolder = async (path) => {
  const files = await fs.readdir(path);
  for (const file of files) {
    await cacheFile(file);
  }
};

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  return Buffer.concat(buffers).toString();
};

const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(`"${message}"`);
};

const start = async () => {
  http.createServer(async (req, res) => {
    const [first, second] = req.url.substring(1).split("/");
    if (first === "api") {
      const method = api.get(second);
      const args = await receiveArgs(req);
      try {
        const result = await method(...args);
        if (!result) {
          httpError(res, 500, "Server error");
          return;
        }
        res.end(JSON.stringify(result));
      } catch (err) {
        console.dir({ err });
        httpError(res, 500, "Server error");
      }
    }
  }).listen(8000);
  await cacheFolder(apiPath);
  console.dir({ api });
  console.log("Server started");
};

module.exports = { start };
