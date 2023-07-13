"use strict";

const fsp = require("node:fs").promises;
const path = require("node:path");
const pg = require("pg");
const metasql = require("metasql");

//   host: "localhost",
//   port: 5433,
//   name: "node-2022",
//   user: "postgres",
//   password: "1q2w3e3e2w1q4r"

const POSTGRES = {
  host: "localhost",
  port: 5433,
  database: "HPW_NodeJSApp_main_postgres",
  user: "postgres",
  password: "postgres",
};

const APPLICATION = {
  host: "localhost",
  port: 5433,
  database: "HPW_NodeJSApp_main_application",
  user: "postgres",
  password: "postgres",
};

const DB = path.join(process.cwd(), "./db");
const SCHEMAS = path.join(process.cwd(), "./schemas");

const read = (name) => fsp.readFile(path.join(DB, name), "utf8");

const execute = async (client, sql) => {
  try {
    await client.query(sql);
  } catch (err) {
    const { message, detail } = err;
    console.error(`${sql}\n${message}\n${detail}\n`);
  }
};

const notEmpty = (s) => s.trim() !== "";

const executeFile = async (client, name) => {
  console.log(`Execute file: ${name}`);
  const sql = await read(name);
  const commands = sql.split(";\n").filter(notEmpty);
  for (const command of commands) {
    await execute(client, command);
  }
};

(async () => {
  await metasql.create(SCHEMAS, DB);

  const databaseFile = path.join(DB, "database.sql");
  const structureFile = path.join(DB, "structure.sql");
  await fsp.rename(databaseFile, structureFile);

  console.log("Generating typings domain.d.ts");

  const typesFile = path.join(DB, "database.d.ts");
  const domainTypes = path.join(DB, "domain.d.ts");
  await fsp.rename(typesFile, domainTypes);

  console.log("Creating DB");

  const inst = new pg.Client(POSTGRES);
  await inst.connect();
  await executeFile(inst, "install.sql");
  await inst.end();

  console.log("Generating DB initial structure and data mocks");

  const db = new pg.Client(APPLICATION);
  await db.connect();
  await executeFile(db, "structure.sql");
  await executeFile(db, "data.sql");
  await db.end();

  console.log("Environment is ready");
})().catch((err) => {
  console.error(err);
});
