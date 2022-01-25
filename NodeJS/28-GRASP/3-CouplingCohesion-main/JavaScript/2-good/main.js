"use strict";

const http = require("http");

const logger = require("./logger.js");
const delay = require("./delay.js");
const timeout = require("./timeout.js");

const routing = {
  "/": async () => "Hello World!",
  "/page1": async () => {
    await delay(5000);
    return "Hello World!";
  },
};

http.createServer(async (req, res) => {
  const { method, url, headers } = req;
  const requestTime = Date.now();

  res.on("close", () => {
    const time = Date.now() - requestTime;
    logger(method, url, headers.referer, time);
  });

  const handler = routing[req.url];
  if (!handler) return res.end("Not found");
  const result = await Promise.race([handler(), timeout(1000)]);
  res.end(result);
}).listen(8000);
