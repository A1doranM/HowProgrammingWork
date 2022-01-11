"use strict";

const fs = require("fs");

// file => serializer => app => module => kind => msg

const logger = file => {
  const { isTTY } = file; // Если надо выводить в консоль.
  const stream = isTTY ? file : fs.createWriteStream(file);
  return (serializer = logger.defaultSerializer) => app => module => kind => { // Возвращаем каррированную функцию которая принимает в себя разные параметры.
    const color = isTTY ? (logger.colors[kind] || logger.colors.info) : ""; // Переводим консоль в режим вывода определенным цветом.
    const normal = isTTY ? logger.colors.normal : ""; // Возвращаем в нормальное состояние.
    return msg => {
      const date = new Date().toISOString();
      const record = { date, kind, app, module, msg };
      const line = serializer(record);
      stream.write(color + line + normal + "\n");
    };
  };
};

// Берем все значения из объекта и разделяем их табуляцией.
logger.defaultSerializer = obj => Object.values(obj).join("\t");

logger.colors = {
  warning: "\x1b[1;33m",
  error: "\x1b[0;31m",
  info: "\x1b[1;37m",
  normal: "\x1b[0m",
};

module.exports = logger;
