"use strict";

const logger = (method, url, referer, time) => {
  console.log(`${method} ${url} ${referer} ${time}`);
};

module.exports = logger;
