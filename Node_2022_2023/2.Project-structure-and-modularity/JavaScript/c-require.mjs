// Как в ECMA модулях получить доступ к require
// Для этого есть встроенная библиотека которая может создать нам require.
import { createRequire } from "node:module";

console.log({ "import.meta": import.meta });

// Создаем require передав ему путь к текущему файлу.
const require = createRequire(import.meta.url);

const fs = require("node:fs"); // Юзаем.
console.log(Object.keys(fs));

console.log({ require });
