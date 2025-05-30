"use strict";

const db = require("./db.js");
const hash = require("./hash.js");

const users = db("users");

// Переопределим поведение методов для юзера, например пароль пишем с хэшем

module.exports = {
  read(id) {
    return users.read(id, ["id", "login"]);
  },

  async create({ login, password }) {
    const passwordHash = await hash(password);
    return users.create({ login, password: passwordHash });
  },

  async update(id, { login, password }) {
    const passwordHash = await hash(password);
    return users.update(id, { login, password: passwordHash });
  },

  delete(id) {
    return users.delete(id);
  },
};
