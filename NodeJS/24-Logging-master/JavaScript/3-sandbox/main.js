"use strict";

const vm = require("vm");
const fsp = require("fs").promises;
const util = require("util");
const metalog = require("metalog");

(async () => {

  const logger = await metalog.openLog({
    path: "./log",
    workerId: 1,
    writeInterval: 5000,
    writeBuffer: 64 * 1024,
    keepDays: 5,
    toStdout: [],
    home: process.cwd(),
  });

  const context = {
    module: {},
    console: logger.console,
  };

  context.global = context;
  const sandbox = vm.createContext(context);

  const fileName = "./application.js";
  const src = await fsp.readFile(fileName, "utf8");
  const script = new vm.Script(`module.exports = () => {\n${src}\n};`);
  const execute = script.runInNewContext(sandbox);
  execute();
  logger.close();

})();
