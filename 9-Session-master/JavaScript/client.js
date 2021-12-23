"use strict";

const Session = require("./session.js");

const UNIX_EPOCH = "Thu, 01 Jan 1970 00:00:00 GMT";
const COOKIE_EXPIRE = "Fri, 01 Jan 2100 00:00:00 GMT";
const COOKIE_DELETE = `=deleted; Expires=${UNIX_EPOCH}; Path=/; Domain=`;

// Функция для парсинга хоста, если ничего не пришло ставим дефолтный хост
const parseHost = (host) => {
  if (!host) return "no-host-name-in-http-headers";
  const portOffset = host.indexOf(":");
  if (portOffset > -1) host = host.substr(0, portOffset); //Убираем номер порта если он указан
  return host;
};

class Client {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.host = parseHost(req.headers.host);
    this.token = undefined;
    this.session = null;
    this.cookie = {};
    this.preparedCookie = []; // Массив всех куки файлов
    this.parseCookie();
  }

  static async getInstance(req, res) {
    const client = new Client(req, res);
    await Session.restore(client);
    return client;
  }

  parseCookie() {
    const {req} = this;
    const {cookie} = req.headers; // Достаем куки из хедеров
    if (!cookie) return;
    const items = cookie.split(";");
    for (const item of items) { // Проходимся по содержимому
      const parts = item.split("=");
      const key = parts[0].trim();
      const val = parts[1] || "";
      this.cookie[key] = val.trim();
    }
  }

  setCookie(name, val, httpOnly = false) {
    const {host} = this;
    const expires = `expires=${COOKIE_EXPIRE}`;
    let cookie = `${name}=${val}; ${expires}; Path=/; Domain=${host}`; // Если дописан путь то браузре будет отправлять только те куки которые подходят по текущий урл
    if (httpOnly) cookie += "; HttpOnly"; // http-only означает что скрипт на клиенте не получит доступа к куки с этим флагом, а вот мы на сервере получим.
    this.preparedCookie.push(cookie);
  }

  deleteCookie(name) {
    this.preparedCookie.push(name + COOKIE_DELETE + this.host); // Ставим куки прошедшую дату и флаг deleted, такой куки будет удален браузером
  }

  sendCookie() {
    const {res, preparedCookie} = this;
    // Как только выполняется sendHeader, res.write, res.end, ..., то хттп заголовки выставляются и
    if (preparedCookie.length && !res.headersSent) { // res.headersSent устанавливается в true тоесть свои куки мы туда прикрепить уже не сможем
      console.dir({preparedCookie});
      res.setHeader("Set-Cookie", preparedCookie); // добавляем куки к заголовку.
    }
  }
}

module.exports = Client;
