"use strict";

// Пример с сериализацией параметров для функции crypto.

const crypto = require("node:crypto");

const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }; // Параметры.
const SCRYPT_PREFIX = "$scrypt$N=32768,r=8,p=1,maxmem=67108864$";

const serializeHash = (hash, salt) => {
  const saltString = salt.toString("base64").split("=")[0];
  const hashString = hash.toString("base64").split("=")[0];
  return `${SCRYPT_PREFIX}${saltString}$${hashString}`;
};

const parseOptions = (options) => { // Функция из строки достает параметры алгоритма.
  const values = [];
  const items = options.split(",");
  for (const item of items) {
    const [key, val] = item.split("=");
    values.push([key, Number(val)]);
  }
  return Object.fromEntries(values);
};

const deserializeHash = (phcString) => { // Разбиваем строку на части по знаку доллара.
  const [, name, options, salt64, hash64] = phcString.split("$");
  if (name !== "scrypt") {
    throw new Error("Node.js crypto module only supports scrypt");
  }
  const params = parseOptions(options);
  const salt = Buffer.from(salt64, "base64"); // Достали соль
  const hash = Buffer.from(hash64, "base64"); // Хэщ
  return { params, salt, hash }; // И вернули все.
};

const SALT_LEN = 32;
const KEY_LEN = 64;

const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(SALT_LEN, (err, salt) => { // Генерируем соль
      if (err) {
        reject(err);
        return;
      }
      // Создаем хэш по нашим параметрам.
      crypto.scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(serializeHash(hash, salt));
      });
    });
  });

// Валидация пароля, сравниваем хэш который в базе с хэшированным паролем от пользователя.
const validatePassword = (password, serHash) => {
  const { params, salt, hash } = deserializeHash(serHash); // Для начала десериализуем хэш
  return new Promise((resolve, reject) => {
    const callback = (err, hashedPassword) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(crypto.timingSafeEqual(hashedPassword, hash)); // Выполняем сравнение с защитой от атак по времени
                                                             // кароче говоря чем более пароль похож на оригинальный
                                                             // тем меньше времени займет ответ от сервера
                                                             // для того чтобы нельзя было этого выяснить в метархии есть
                                                             // вот такая функция которая все отдаст за примерно одно время.
    };
    crypto.scrypt(password, salt, hash.length, params, callback); // Прогоняем пароль через хэширование используя параметры
                                                                  // которые мы получили из БД.
  });
};

module.exports = {
  hashPassword,
  validatePassword,
};
