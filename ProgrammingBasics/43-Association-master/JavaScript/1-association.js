"use strict";

// Пробуем использовать ассоциации и вместо наследований. Это не всегда
// хорошо но иногда позволяет сделать код лучше.

// Пример с логгером который внутри себя должен иметь ссылку на поток в
// который он пишет.
// Вместо того чтобы наследовать логгер от стрима мы создаем независимый
// логгер для которого можно задавать стрим.

class Logger {
  constructor() {
    this.stream = null;
  }

  log(message) {
    if (this.stream) {
      this.stream.write(message + "\n");
    }
  }
}

// Usage

const logger = new Logger();
logger.stream = process.stdout; // Ассоциируем стрим для логгера.
logger.log("Here we are");
