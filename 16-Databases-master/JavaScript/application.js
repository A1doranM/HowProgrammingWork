"use strict";

const db = require("./db.js");

const pg = db.open({
  host: "127.0.0.1",
  port: 5432,
  database: "application",
  user: "postgres",
  password: "postgres",
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
