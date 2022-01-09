"use strict";

const db = require("./db.js"); // обертка над ПГ.

const pg = db.open({
  host: "127.0.0.1",
  port: 5432,
  database: "application",
  user: "postgres",
  password: "1q2w3e3e2w1q4r",
});

console.dir({ pg });

pg.select("pg_tables")
  .where({ tableowner: "postgres", schemaname: "public" })
  .fields(["schemaname", "tablename", "tableowner", "hasindexes"])
  .order("tablename")
  .then((rows) => {
    console.table(rows);
    pg.close();
  });
