"use strict";

module.exports = {
  static: {
    port: 8000,
  },
  api: {
    port: 8001,
    transport: "http",
  },
  sandbox: {
    timeout: 5000,
    displayErrors: false,
  },
  db: {
    url: process.env.DATABASE_URL
  },
};
