"use strict";

// Пример с логгером для которого мы стрим передаем в конструктор.

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
const logger = new Logger(stream); // Агрегируем стрим для логгера.
logger.log("Here we are");
