"use strict";

const fs = require("fs");
const http = require("http");

const person = { name: "MarcusAurelius" };
const index = fs.readFileSync("./6-client.html");

http.createServer((req, res) => {
  const { url } = req;
  if (url === "/person") {
    res.end(JSON.stringify(person));
  } else {
    res.end(index);
  }
}).listen(8000);
