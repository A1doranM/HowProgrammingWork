// Пример с ЕСМА модулями
// Создаем функцию рекваир так как модули надо подгружать при помощи нее,
// а в ЕСМА модулях такой функции нету.

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const example = require("./build/Release/example.node");

const sum = example.add(3, 7);
console.log({ sum });

const res = example.addCallback(3, 7, (error, data) => {
  console.log({ data });
  return "done";
});
console.log({ res });
