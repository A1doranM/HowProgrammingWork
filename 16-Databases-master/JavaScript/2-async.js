"use strict";

const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "application",
  user: "postgres",
  password: "1q2w3e3e2w1q4r",
});

(async () => {
  const fields = ["schemaname", "tablename", "tableowner"].join(", ");
  const sql = `SELECT ${fields} FROM pg_tables WHERE tableowner = $1`;
  const { rows } = await pool.query(sql, ["postgres"]); // Асинхронная работа с базой данных.
  console.table(rows);
  pool.end(); // Закрывам пулл.
})();
