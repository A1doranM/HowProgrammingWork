"use strict";

const delay = require("./delay.js");

// Теперь таймаут ничего не знает про запросы и ответы.
const timeout = async (msec) => {
  const start = Date.now();
  await delay(msec);
  const time = Date.now() - start;
  return `Timeout reached: ${time} >= ${msec}`;
};

module.exports = timeout;
