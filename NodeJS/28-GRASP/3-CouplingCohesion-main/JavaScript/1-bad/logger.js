"use strict";

// Логгер внутри себя имеет мидлвару.

const writeLog = (req, res) => () => {  // Сама функция логирования.
  const time = Date.now() - req.requestTime;
  // Не зная что именно нам передали в req, и res мы пытаемся обратиться к их полям, так же бред.
  console.log(`${req.method} ${req.url} ${req.headers.referer} ${time}`);
};

// Внутри обертки логера передаются req, res, next которые ему вообще не нужны.
const logger = (req, res, next) => {
  req.requestTime = Date.now(); // Создаем примесь в req что просто пиздец. Нарушаем принцип информационного эксперта заодно.
  res.on("close", writeLog(req, res)); // Садимся на событие и передаем ссылки в логер, чем логер так же не должен заниматься.
  next(); // Вызываем следующий мидлвар.
};

module.exports = logger;
