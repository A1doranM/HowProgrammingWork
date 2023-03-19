"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");

const UINT32_MAX = 0xffffffff;
const BUF_LEN = 1024; // один килобайт
const BUF_SIZE = BUF_LEN * Uint32Array.BYTES_PER_ELEMENT; // 4kb случайных чисел

const randomPrefetcher = {
  buf: crypto.randomBytes(BUF_SIZE), // Initial buffer data
  pos: 0, // Начальная позиция буфера.
  next() { // Читаем по 4 байта с буфера.
    const { buf, pos } = this;
    let start = pos;
    if (start === buf.length) { // Если дошли до длины буфера начинаем заново.
      start = 0;
      crypto.randomFillSync(buf); // И снова генерируем новые числа в буфер.
    }
    const end = start + Uint32Array.BYTES_PER_ELEMENT; // Иначе просто сдвигаем указатель на след.
    this.pos = end; // позицию
    return buf.slice(start, end);
  },
};

// Вокруг генератора сделаем две функции

const cryptoRandom = () => {  // Первая
  const buf = randomPrefetcher.next();
  return buf.readUInt32LE(0) / (UINT32_MAX + 1); // Вычитываем из буфера данные и делаем какое-то случайное число.
};

// Кастомная реализация создания ЮЮИД.
// Его формат вот такой
// xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
// 4 бита M обозначают версию («version») UUID, а 1-3 старших бита N обозначают вариант («variant») UUID.

const generateUUID = () => { // Вторая генерирует ююид.
  const h1 = randomPrefetcher.next().toString("hex"); // Первые две пачки переводим в хекс
  const h2 = randomPrefetcher.next().toString("hex");
  const buf = randomPrefetcher.next(); // Делаем третью пачку
  buf[0] = (buf[0] & 0x0f) | 0x40; // в ней часть битов заменим версией
  buf[2] = (buf[2] & 0x3f) | 0x80; // и вариантом
  const h3 = buf.toString("hex"); // переводим в хекс.
  const h4 = randomPrefetcher.next().toString("hex"); // Делаем 4 пачку.
  const d2 = h2.substring(0, 4); // Из второй пачки берем только первые 4 буквы
  const d3 = h3.substring(0, 4); // записываем туда 4 буквы из 3 пачки
  const d4 = h3.substring(4, 8); // в 4 записываем вторые 4 буквы из 3 пачки
  const d5 = h2.substring(4, 8) + h4; // записываем вторые 4 буквы из 2пачки плюс четвертую пачку.
  return [h1, d2, d3, d4, d5].join("-"); // Первую пачку кстати записали как есть, теперь все пачки
                                         // разделим тире и получим строку в формате ююид.
};

const generateKey = (length, possible) => { // Генерируем ключи нужной длины с заданными буквами.
  const base = possible.length;
  let key = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(cryptoRandom() * base);
    key += possible[index];
  }
  return key;
};

const CRC_LEN = 4;

const crcToken = (secret, key) => {
  const md5 = crypto.createHash("md5").update(key + secret);
  return md5.digest("hex").substring(0, CRC_LEN);
};

const generateToken = (secret, characters, length) => {
  const key = generateKey(length - CRC_LEN, characters);
  return key + crcToken(secret, key);
};

const validateToken = (secret, token) => {
  if (!token) return false;
  const len = token.length;
  const crc = token.slice(len - CRC_LEN);
  const key = token.slice(0, -CRC_LEN);
  return crcToken(secret, key) === crc;
};

// Only change these if you know what you"re doing
const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const SCRYPT_PREFIX = "$scrypt$N=32768,r=8,p=1,maxmem=67108864$";

const serializeHash = (hash, salt) => {
  const saltString = salt.toString("base64").split("=")[0];
  const hashString = hash.toString("base64").split("=")[0];
  return `${SCRYPT_PREFIX}${saltString}$${hashString}`;
};

const parseOptions = (options) => {
  const values = [];
  const items = options.split(",");
  for (const item of items) {
    const [key, val] = item.split("=");
    values.push([key, Number(val)]);
  }
  return Object.fromEntries(values);
};

const deserializeHash = (phcString) => {
  const [, name, options, salt64, hash64] = phcString.split("$");
  if (name !== "scrypt") {
    throw new Error("Node.js crypto module only supports scrypt");
  }
  const params = parseOptions(options);
  const salt = Buffer.from(salt64, "base64");
  const hash = Buffer.from(hash64, "base64");
  return { params, salt, hash };
};

const SALT_LEN = 32;
const KEY_LEN = 64;

const hashPassword = (password) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(SALT_LEN, (err, salt) => {
      if (err) {
        reject(err);
        return;
      }
      crypto.scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(serializeHash(hash, salt));
      });
    });
  });

let defaultHash;
hashPassword("").then((hash) => {
  defaultHash = hash;
});

const validatePassword = (password, serHash = defaultHash) => {
  const { params, salt, hash } = deserializeHash(serHash);
  return new Promise((resolve, reject) => {
    const callback = (err, hashedPassword) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(crypto.timingSafeEqual(hashedPassword, hash));
    };
    crypto.scrypt(password, salt, hash.length, params, callback);
  });
};

const md5 = (filePath) => {
  const hash = crypto.createHash("md5");
  const file = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    file.on("error", reject);
    hash.once("readable", () => {
      resolve(hash.read().toString("hex"));
    });
    file.pipe(hash);
  });
};

module.exports = {
  cryptoRandom,
  generateUUID,
  generateKey,
  crcToken,
  generateToken,
  validateToken,
  hashPassword,
  validatePassword,
  md5,
};
