"use strict";

// При композиции мы внутри коструктора создаем стрим здесь логгер перестает
// быть таким гибким как раньше и начинает писать только в файл.

const fs = require("fs");

class Logger {
  constructor(name) {
    this.stream = fs.createWriteStream(name);
  }

  log(message) {
    this.stream.write(message + "\n");
  }
}

// Usage

const logger = new Logger("file.log");
logger.log("Here we are");
