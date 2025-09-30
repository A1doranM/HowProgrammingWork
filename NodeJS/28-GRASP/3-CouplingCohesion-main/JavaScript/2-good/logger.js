"use strict";

// Теперь логер ничего не знает про реквест и респонс,
// у него есть конкретный интерфейс с которым он работает.
const logger = (method, url, referer, time) => {
  console.log(`${method} ${url} ${referer} ${time}`);
};

module.exports = logger;
