"use strict";

// Фабрика функций.

const colors = {
  warning: "\x1b[1;33m",
  error: "\x1b[0;31m",
  info: "\x1b[1;37m"
};

const logger = (level = "info") => { // Фабрика, первый аргумент это уровень логирования
  const color = colors[level]; // берем цвет выводимого текста из справочника.
  return s => { // Возвращаем переданную страку добавляя ей цвет и дату.
    const date = new Date().toISOString();
    console.log(color + date + "\t" + s);
  };
};

const warning = logger("warning");
warning("Hello");

const info = logger("error");
info("Hello error");
