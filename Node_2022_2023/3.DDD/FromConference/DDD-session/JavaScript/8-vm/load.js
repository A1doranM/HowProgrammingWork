"use strict";

// Модуль для подгрузки файлов.

const fs = require("node:fs").promises;
const vm = require("node:vm");

const RUN_OPTIONS = { timeout: 5000, displayErrors: false };

module.exports = async (filePath, sandbox) => {
  const src = await fs.readFile(filePath, "utf8"); // Читаем код файла
  const code = `"use strict";\n${src}`; // приклеиваем к нему use strict
  const script = new vm.Script(code); // создаем скрипт
  console.log({ script });
  const context = vm.createContext(Object.freeze({ ...sandbox })); // создаем контекст передав ему замороженный сэндбокс
  const exported = script.runInContext(context, RUN_OPTIONS); // запускаем скрипт с контекстом и опциями
  console.log({ exported });
  return exported; // и то что скрипт из себя экспортирует отдаем назад.
};
