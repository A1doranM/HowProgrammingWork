"use strict";

const storage = require("./storage.js");

const TOKEN_LENGTH = 32;
const ALPHA_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz";
const ALPHA = ALPHA_UPPER + ALPHA_LOWER;
const DIGIT = "0123456789";
const ALPHA_DIGIT = ALPHA + DIGIT;

const generateToken = () => { // Генерируем токен сессии
  const base = ALPHA_DIGIT.length;
  let key = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) { // Выбираем случайным образом число из нашей строки
    const index = Math.floor(Math.random() * base);
    key += ALPHA_DIGIT[index];
  }
  return key;
};

// Данный класс отвечает за получение куки и восстановление сессии, сессию мы храним на диске.
// Наследуем его от Мар чтобы использовать класс как коллекцию элементов.
class Session extends Map {
  constructor(token) {
    super();
    this.token = token;
  }

  static start(client) {
    if (client.session) return client.session;
    const token = generateToken();
    client.token = token;
    const session = new Session(token); // Создаем новую сессию
    client.session = session;
    client.setCookie("token", token); // устанавливаем куки
    storage.set(token, session); // сохраняем сессию в хранилище, где ключем является токен
    return session;
  }

  static restore(client) {
    const { cookie } = client; // забираем куки у клиента
    if (!cookie) return;
    const sessionToken = cookie.token; // из куки берем токен сессии
    if (sessionToken) {
      return new Promise((resolve, reject) => {
        storage.get(sessionToken, (err, session) => {
          if (err) reject(new Error("No session"));
          Object.setPrototypeOf(session, Session.prototype); // Сессия это восстановленный Мар, но он еще не связан с нашим классом сессии
          // но из-за того что он был восстановлен из сериализованного формата который хранится в файле у него есть все
          // аттрибуты из Мар но он пока не связан с сессией, а таким образом мы его связываем.
          // Это происходит из-за того что изначально мы наследуемся от Мар, который является встроенным типом данных, тогда как наша сессия нет.
          // Поэтому после воостановления надо связать ее с сессией.
          client.token = sessionToken;
          client.session = session;
          resolve(session);
        });
      });
    }
  }

  static delete(client) {
    const { token } = client;
    if (token) {
      client.deleteCookie("token");
      client.token = undefined;
      client.session = null;
      storage.delete(token);
    }
  }

  save() {
    storage.save(this.token);
  }
}

module.exports = Session;
