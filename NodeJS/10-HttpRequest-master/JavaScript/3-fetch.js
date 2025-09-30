"use strict";

const http = require("http");
const https = require("https");

// Собственная реализация fetch метода.
const fetch = (url) => new Promise((resolve, reject) => {
  const protocol = url.startsWith("https") ? https : http; // Выбираем какой протокол использовать исходя из ссылки которую нам дали.
  protocol.get(url, res => {
    if (res.statusCode !== 200) {
      const { statusCode, statusMessage } = res;
      reject(new Error(`Status Code: ${statusCode} ${statusMessage}`));
    }
    res.setEncoding("utf8");
    const buffer = [];
    res.on("data", chunk => buffer.push(chunk));
    res.on("end", () => resolve(buffer.join()));
  });
});

// Usage

fetch("https://ietf.org/")
  .then(body => console.log(body))
  .catch(err => console.error(err));
