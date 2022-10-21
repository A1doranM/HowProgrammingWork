"use strict";

const http = require("node:http");

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
};

module.exports = (routing, port) => {
  const server = http.createServer(async (req, res) => {
    console.log("Request: ", req, res);

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, PATCH, DELETE",
      "Accept-Control-Allow-Headers": "Origin X-Requested-With, Content-Type, Accept",
      "Access-Control-Max-Age": 2592000, // 30 days
    };

    if (req.method === "OPTIONS") {
      res.writeHead(204, headers);
      res.end();
      return;
    }


    const { url, socket } = req;
    const [name, method, id] = url.substring(1).split("/");
    const entity = routing[name];

    if (!entity) return res.end("Not found");

    const handler = entity[method];

    if (!handler) return res.end("Not found");

    const src = handler.toString();
    const signature = src.substring(0, src.indexOf(")"));
    const args = [];

    if (signature.includes("(id")) args.push(id);
    if (signature.includes("{")) args.push(await receiveArgs(req));

    console.log(`Request: ${socket.remoteAddress} ${method} ${url}`);

    const result = await handler(...args);
    res.end(JSON.stringify(result.rows));
  });

  server.listen(port);

  console.log(`API on port ${port}`);
};
