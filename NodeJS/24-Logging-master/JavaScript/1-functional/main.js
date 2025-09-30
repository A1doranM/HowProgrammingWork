"use strict";

const logger = require("./logger.js");

// On application initialization

const application = {};
application.logger = logger(process.stdout)()("app1");
//application.logger = logger("./file.log")(JSON.stringify)("app1");

// In module1

const module1 = {};
module1.logger = application.logger("module1");

// Create functions

const info = module1.logger("info");
const warning = module1.logger("warning");
const error = module1.logger("error");
const debug = module1.logger("debug");

// Usage

info("I have info for you");
warning("Hello there!");
error("World is not found");
debug("Bye!");

/*
const begin = process.hrtime.bigint();
for (let i = 0; i < 1000000; i++) {
  info("Write more then 60Mb logs, line: " + i);
}
const end = process.hrtime.bigint();
const time = (end - begin) / 1000000n;
console.log(`Time: ${time} milliseconds`);
*/
