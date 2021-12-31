"use strict";

const { Pool } = require("pg"); // node-postgres. Один из лучших драйверов для Постгрес.

const pool = new Pool({ // Создаем пулл соединений
  host: "127.0.0.1",           // это делается чтобы переиспользуемые соединения хранились в пуле
  port: 5432,                  // пока одно соединение используется одним запросом никто не может им пользоваться.
  database: "application",     // Размер пула можно настраивать.
  user: "postgres",
  password: "postgres",
});

const fields = ["schemaname", "tablename", "tableowner"].join(", ");
const sql = `SELECT ${fields} FROM pg_tables WHERE tableowner = $1`;
pool.query(sql, ["postgres"], (err, res) => {
  if (err) {
    throw err;
  }
  console.dir({ res });
  console.table(res.fields);
  console.table(res.rows);
  pool.end();
});
