"use strict";
// 5. Server structure and GOF patterns in it
const path = require("node:path");

const console = require("./lib/logger.js");
const common = require("./lib/common.js");

const { loadDir } = require("./src/loader.js");
const { Server } = require("./src/server.js");

const appPath = path.join(process.cwd(), "../NodeJS-Pure-main");

const api = Object.freeze({});
const sandbox = { console, common, api, db: null };

(async () => {
  const configPath = path.join(appPath, "./config");
  const configData = await loadDir(configPath, sandbox);

  const config = Object.fromEntries(configData);

  const db = require("./lib/db.js")(config.db);
  sandbox.db = Object.freeze(db);

  const apiPath = path.join(appPath, "./api");
  const routing = await loadDir(apiPath, sandbox, true);

  const application = { path: appPath, sandbox, console, config, routing };
  application.server = new Server(application);
})();
