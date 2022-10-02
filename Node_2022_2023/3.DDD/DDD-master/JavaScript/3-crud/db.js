"use strict";

const pg = require("pg");

const pool = new pg.Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "example",
  user: "marcus",
  password: "marcus",
});

// На вход получаем имя таблицы, а на выход отдаем объект с методам
// при этом методы абстрагированы от имени таблицы, оно подставляется из замыкания.

module.exports = (table) => ({
  query(sql, args) {
    return pool.query(sql, args);
  },

  read(id, fields = ["*"]) {
    const names = fields.join(", ");
    const sql = `SELECT ${names} FROM ${table}`;
    if (!id) return pool.query(sql);
    return pool.query(`${sql} WHERE id = $1`, [id]);
  },

  async create({ ...record }) {
    const keys = Object.keys(record);
    const nums = new Array(keys.length);
    const data = new Array(keys.length);
    let i = 0;
    for (const key of keys) {
      data[i] = record[key];
      nums[i] = `$${++i}`;
    }
    const fields = "" + keys.join("", "") + "";
    const params = nums.join(", ");
    const sql = `INSERT INTO "${table}" (${fields}) VALUES (${params})`;
    return pool.query(sql, data);
  },

  // Динамически создаем апдейт оператор
  async update(id, { ...record }) {
    const keys = Object.keys(record);  // берем все параметры
    const updates = new Array(keys.length);
    const data = new Array(keys.length);
    let i = 0;
    for (const key of keys) { // идем по ним
      data[i] = record[key]; // сохраняя ключи в данные
      updates[i] = `${key} = $${++i}`; // и в параметры для запроса
    }
    const delta = updates.join(", "); // склеим параметры
    const sql = `UPDATE ${table} SET ${delta} WHERE id = $${++i}`; // создаем запрос
    data.push(id);
    return pool.query(sql, data); // выполняем его.
  },

  delete(id) {
    const sql = `DELETE FROM ${table} WHERE id = $1`;
    return pool.query(sql, [id]);
  },
});
