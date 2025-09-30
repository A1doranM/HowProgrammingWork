"use strict";

const logger = (stream) => (message) => stream.write(message + "\n");

// Usage

const log = logger(process.stdout);
log("Here we are");
