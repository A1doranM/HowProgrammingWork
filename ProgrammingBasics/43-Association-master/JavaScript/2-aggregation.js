"use strict";

class Logger {
  constructor(stream) {
    this.stream = stream;
  }

  log(message) {
    if (this.stream) {
      this.stream.write(message + "\n");
    }
  }
}

// Usage

const stream = process.stdout;
const logger = new Logger(stream);
logger.log("Here we are");
