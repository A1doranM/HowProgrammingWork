"use strict";

const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "application",
  user: "postgres",
  password: "postgres",
});

(async () => {
  const fields = ["schemaname", "tablename", "tableowner"].join(", ");
  const sql = `SELECT ${fields} FROM pg_tables WHERE tableowner = $1`;
  const { rows } = await pool.query(sql, ["postgres"]);
  console.table(rows);
  pool.end();
})();
