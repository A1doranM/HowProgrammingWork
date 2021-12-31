"use strict";

const { Pool } = require("pg"); // node-postgres. Один из лучших драйверов для Постгрес.

const pool = new Pool({ // Создаем пулл соединений
  host: "127.0.0.1",           // это делается чтобы переиспользуемые соединения хранились в пуле
  port: 5432,                  // пока одно соединение используется одним запросом никто не может им пользоваться.
  database: "application",     // Размер пула можно настраивать.
  user: "postgres",
  password: "1q2w3e3e2w1q4r",
});

const fields = ["schemaname", "tablename", "tableowner"].join(", ");
const sql = `SELECT ${fields} FROM pg_tables WHERE tableowner = $1`;
pool.query(sql, ["postgres"], (err, res) => { // Выполняем запрос
  if (err) {
    throw err;
  }
  console.dir({ res });
  console.table(res.fields);
  console.table(res.rows); // выводим таблицу с базы,
  pool.end(); // закрываем пул, без этого соединение не закроется и хотя скрипт закончится, сам процесс будет висеть и ждать.
});
