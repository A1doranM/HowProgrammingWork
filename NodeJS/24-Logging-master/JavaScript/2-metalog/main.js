"use strict";

const metalog = require("metalog");

(async () => {

  const logger = await metalog.openLog({
    path: "./log",
    workerId: 1,
    writeInterval: 3000,
    writeBuffer: 64 * 1024,
    keepDays: 5,
    toStdout: ["log", "info", "warn", "error"],
    home: process.cwd(),
  });

  logger.console.assert(true, "Assert message: passed");
  logger.console.assert(false, "Assert message: not passed");
  logger.console.count("count-label");
  logger.console.countReset("count-label");
  logger.console.debug("Test log message for console.debug", "arg2");
  logger.console.dir("Test log message for console.dir", "arg2");
  const err = new Error("Test log message for console.error", "arg2");
  logger.console.error(err);
  logger.console.group("Test log message for console.group", "arg2");
  logger.console.groupCollapsed("Test log message for console.group", "arg2");
  logger.console.groupEnd();
  logger.console.info("Test log message for console.info", "arg2");
  logger.console.log("Test log message for console.log", "arg2");
  logger.console.table([
    { a: 1, b: 2 },
    { a: 3, b: 4 },
  ]);
  logger.console.time("time-label");
  logger.console.timeEnd("time-label");
  logger.console.timeLog("time-label", "Test log message for console.timeLog");
  logger.console.trace("Test log message for console.trace", "arg2");
  logger.console.warn("Test log message for console.warn", "arg2");

  const begin = process.hrtime();
  for (let i = 0; i < 1000000; i++) {
    logger.console.debug("Write more then 60Mb logs, line: " + i);
  }

  logger.on("close", () => {
    const end = process.hrtime(begin);
    const time = end[0] * 1e9 + end[1];
    console.log({ time });
  });

  await logger.close();

})();
