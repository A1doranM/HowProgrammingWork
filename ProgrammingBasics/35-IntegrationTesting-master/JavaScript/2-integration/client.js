"use strict";

const http = require("http");

const api = {};
const methods = ["startCounter", "stopCounter"];

const createMethod = (name) => (...args) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: "localhost",
    port: 8000,
    path: `/api/${name}`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, async (res) => {
    if (res.statusCode !== 200) {
      reject();
      return;
    }
    res.setEncoding("utf8");
    const buffers = [];
    res.on("data", (chunk) => {
      buffers.push(chunk);
    }).on("end", () => {
      const data = Buffer.concat(buffers).toString();
      resolve(JSON.parse(data));
    }).on("error", reject);
  });
  req.end(JSON.stringify(args));
});

for (const method of methods) {
  api[method] = createMethod(method);
}

module.exports = { api };
