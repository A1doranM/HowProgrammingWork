"use strict";

// Файл для управлением хранилища сесссий.

const fs = require("fs");
const path = require("path");
const v8 = require("v8");

const PATH = `${__dirname}/sessions`;

// Функция-обертка занимается резолвом токена в имя файла.
// В возвращаемую функцию теперь вместо имени файла можно передавать токен.
const safePath = (fn) => (token, ...args) => { // по контракту вначале идут все аргументы, а последним идет коллбэк
  const callback = args[args.length - 1];
  if (typeof token !== "string") { // Если токен не строка то завершаем программу.
    callback(new Error("Invalid session token"));
    return;
  }
  const fileName = path.join(PATH, token); // К пути доклеивам еще токен.
  if (!fileName.startsWith(PATH)) { // Но если кто-то засунул в начало токена переход между папками (аля хацкер).
    // Если путь не начинается на тот с по котрому хранятся все сессии то мы выходим из программы.
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
    const value = super.get(key);
    if (value) {
      callback(null, value);
      return;
    }
    readSession(key, (err, data) => {
      if (err) {
        callback(err);
        return;
      }
      console.log(`Session loaded: ${key}`);
      const session = v8.deserialize(data);
      super.set(key, session);
      callback(null, session);
    });
  }

  save(key) {
    const value = super.get(key);
    if (value) {
      const data = v8.serialize(value);
      writeSession(key, data, () => {
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
