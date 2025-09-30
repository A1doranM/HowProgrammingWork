"use strict";

const fs = require("fs");

// Composition factory

const loggerFactory = (name) => {
  const stream = fs.createWriteStream(name);

  return {
    log(message) {
      stream.write(message + "\n");
    }
  };
};

// Usage

const logger = loggerFactory("file.log");
logger.log("Here we are");
