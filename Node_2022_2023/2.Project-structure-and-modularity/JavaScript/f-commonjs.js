"use strict";

// Напишем свою собственную систему модульности.
// Система модульности самой ноды работает в принципе точно так же, только конечно
// посложнее устроена.

const fs = require("node:fs").promises;
const vm = require("node:vm");

const RUN_OPTIONS = { timeout: 5000, displayErrors: false };

const pseudoRequire = (name) => {
  console.log(`Intercepted require: ${name}`);
};

const load = async (filePath, sandbox) => { // Эта функция будет у нас загружать модули.
  const src = await fs.readFile(filePath, "utf8"); // Считаем файл.
  const code = `(require, module, __filename, __dirname) => {\n${src}\n}`; // Оборачиваем считанный исходник в функцию передавая ему
                                                                          // require, module, __dirname__, __filename__.
  const script = new vm.Script(code); // Создаем новый скрипт
  const context = vm.createContext(Object.freeze({ ...sandbox })); // создаем новый контекс для исполнения и запрещаем его модифицировать.
  const wrapper = script.runInContext(context, RUN_OPTIONS); // Запускаем наш новый исходник и передаем опции для запуска. После того как он исполнился
  const module = {};
  wrapper(pseudoRequire, module, filePath, __dirname); // мы получим враппер в который надо будет поместить зависимости которые мы прописали для модуля.
                                                       // пустой объект module мы передаем для того чтобы пользователь мог к нему что-то примешивать что ему надо.
  return module.exports; // Когда функция отработала мы вернем из функции то что человек экспортирует из своего модуля.
};

const main = async () => {
  const sandbox = { Map: class PseudoMap {} }; // Создадим сэндбокс у которого будет подменен встроенный класс Map.
  const exported = await load("./1-export.js", sandbox); // тоесть если внутри модуля мы напишем например new Map() то создастся экземпляр нашей Map.
  console.log(exported);
};

main();
