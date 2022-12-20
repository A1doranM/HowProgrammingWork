"use strict";

// Добавлен этот файл который перед запуском приложения генерирует
// структуру базы, наполняет ее инфой и т.д.

const fsp = require("node:fs").promises;
const path = require("node:path");
const pg = require("pg");
const metasql = require("metasql");
const config = require("./config.js");

const DB = path.join(process.cwd(), "./db"); // Берем путь к базе данных
const SCHEMAS = path.join(process.cwd(), "./schemas"); // Берем путь к схемам

const read = (name) => fsp.readFile(path.join(DB, name), "utf8");

const execute = async (client, sql) => { // Выполняем SQL скрипт принимая клиент бд и скл файл
  try {
    await client.query(sql);
  } catch (err) {
    console.error(err);
  }
};

const notEmpty = (s) => s.trim() !== "";

const executeFile = async (client, name) => { // Выполняем файл
  console.log(`Execute file: ${name}`);
  const sql = await read(name);
  const commands = sql.split(";\n").filter(notEmpty); // Если у кого-то винда то \n надо поменять на другой разделитель
  for (const command of commands) {
    await execute(client, command);
  }
};

(async () => {
  await metasql.create(SCHEMAS, DB); // Даем схемы и куда сгенерировать БД
  const databaseFile = path.join(DB, "database.sql"); // Переименовываем
  const structureFile = path.join(DB, "structure.sql"); // в структуры
  await fsp.rename(databaseFile, structureFile);  //
  console.log("Generate typings domain.d.ts");
  const typesFile = path.join(DB, "database.d.ts"); //
  const domainTypes = path.join(DB, "domain.d.ts");
  await fsp.rename(typesFile, domainTypes);
  const inst = new pg.Client({ ...config.db, ...config.pg });
  await inst.connect();
  await executeFile(inst, "install.sql");
  await inst.end();
  const db = new pg.Client(config.db);
  await db.connect();
  await executeFile(db, "structure.sql");
  await executeFile(db, "data.sql");
  await db.end();
  console.log("Environment is ready");
})().catch((err) => {
  console.error(err);
});
