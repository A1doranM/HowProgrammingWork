"use strict";

const crypto = require("node:crypto");

const hash = (password) => {
  const salt = crypto.randomBytes(16).toString("base64"); // Динамически вычисляем Соль для каждого нового ключа.
                                                                         // динамическая соль позволяет защититься от нескольких типов атак
                                                                         // и плюс не надо их хранить в конфигах.
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, result) => {
      if (err) reject(err);
      resolve(salt + ":" + result.toString("base64"));
    });
  });
};

module.exports = { hash };
