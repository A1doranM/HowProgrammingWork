"use strict";

// Файл для управлением хранилища сессий.

const fs = require("fs");
const path = require("path");
const v8 = require("v8");

const PATH = `${__dirname}/sessions`;

// Функция-обертка занимается резолвом токена в имя файла.
// В возвращаемую функцию теперь вместо имени файла можно передавать токен.
const safePath =
  (fn) =>
  (token, ...args) => {
    // по контракту вначале идут все аргументы, а последним идет коллбэк.
    const callback = args[args.length - 1];
    if (typeof token !== "string") {
      // Если токен не строка то завершаем программу.
      callback(new Error("Invalid session token"));
      return;
    }
    const fileName = path.join(PATH, token); // К пути доклеивам еще токен.
    if (!fileName.startsWith(PATH)) {
      // Проверяем не засунул ли кто-то в начало токена переход между папками "../" (аля хацкер),
      // если путь не начинается на тот с по котрому хранятся все сессии то мы выходим из программы.
      callback(new Error("Invalid session token"));
      return;
    }
    fn(fileName, ...args); // вызываем переданную нам функцию с именем файла и аргументами.
  };

const readSession = safePath(fs.readFile);
const writeSession = safePath(fs.writeFile);
const deleteSession = safePath(fs.unlink);

class Storage extends Map {
  get(key, callback) {
    const value = super.get(key); // Если ключ уже есть в памяти считываем его, а если нет
    if (value) {
      callback(null, value);
      return;
    }
    readSession(key, (err, data) => {
      // то читаем сессию с диска.
      if (err) {
        callback(err);
        return;
      }
      console.log(`Session loaded: ${key}`);
      const session = v8.deserialize(data); // На выходе получаем объект Мар, но он пока что не наследник от сессии
      super.set(key, session); // кладем его в наше хранилище.
      callback(null, session);
    });
  }

  save(key) {
    const value = super.get(key); // Берем наш токен.
    if (value) {
      const data = v8.serialize(value); // Сериализируем его
      writeSession(key, data, () => {
        // и записываем в фаил.
        console.log(`Session saved: ${key}`);
      });
    }
  }

  delete(key) {
    console.log("Delete: ", key);
    deleteSession(key, () => {
      console.log(`Session deleted: ${key}`);
    });
  }
}

module.exports = new Storage();
