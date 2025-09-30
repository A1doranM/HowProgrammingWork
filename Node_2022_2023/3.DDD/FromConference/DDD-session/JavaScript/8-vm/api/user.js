// Например если обратить внимание то БД мы нигде не экспортим.
// Это потому что БД для этих скриптов будет глобальным объектом когда мы подключим их.

// Можно обратить внимание что мы не делаем никакого экспорта, это потому что vm.runInThisContext()
// вернет результат последнего действия в скрипте, поэтому здесь мы просто объявляем функцию которая возвращает
// некий объект, этот объект и вернется из vm.runInThisContext().
({
  read(id) {
    return db("users").read(id, ["id", "login"]);
  },

  async create({ login, password }) {
    const passwordHash = await common.hash(password);
    return db("users").create({ login, password: passwordHash });
  },

  async update(id, { login, password }) {
    const passwordHash = await common.hash(password);
    return db("users").update(id, { login, password: passwordHash });
  },

  delete(id) {
    return db("users").delete(id);
  },

  find(mask) {
    const sql = "SELECT login from users where login like $1";
    return db("users").query(sql, [mask]);
  },
});
