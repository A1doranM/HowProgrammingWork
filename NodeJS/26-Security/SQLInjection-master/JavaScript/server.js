"use strict";

const http = require("http");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const config = require("./config.js");
const db = new Pool(config);
global.db = db;

const api = new Map();

const apiPath = "./api/";

const loadFile = (name) => {
  const filePath = apiPath + name;
  const key = path.basename(filePath, ".js");
  const method = require(filePath);
  api.set(key, method);
};

const loadFolder = (path) => {
  fs.readdir(path, (err, files) => {
    if (err) return;
    files.forEach(loadFile);
  });
};

loadFolder(apiPath);

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
};

const httpError = (res, status, message) => {
  res.statusCode = status;
  res.end(`"${message}"`);
};

http.createServer(async (req, res) => {
  const url = req.url === "/" ? "/index.html" : req.url;
  const [first, second] = url.substring(1).split("/");
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
  } else {
    const path = `./static/${first}`;
    try {
      const data = await fs.promises.readFile(path);
      res.end(data);
    } catch (err) {
      httpError(res, 404, "File is not found");
    }
  }
}).listen(8000);
