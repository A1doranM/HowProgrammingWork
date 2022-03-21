"use strict";

// Aggregation factory

const loggerFactory = (stream) => ({
  log(message) {
    stream.write(message + "\n");
  }
});

// Usage

const stream = process.stdout;
const logger = loggerFactory(stream);
logger.log("Here we are");
