"use strict";

// Конфигурируемый мидлвар.
const timeout = (msec) => (req, res, next) => {
  setTimeout(() => {
    // Обращаемся к полю requestTime которое в свою очередь устанавливается аж в логере.
    const time = Date.now() - req.requestTime;
    if (!res.headerSent) { // Проверяем не закрыто ли соединение и не отправлены ли заголовки.
      res.end(`Timeout reached: ${time} >= ${msec}`);
    }
  }, msec);
  next();
};

module.exports = timeout;
