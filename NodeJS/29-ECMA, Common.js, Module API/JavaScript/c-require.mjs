import { createRequire } from "module";
console.log({ "import.meta": import.meta });
const require = createRequire(import.meta.url);

// import.meta это специальная ключевая конструкция, а не вызов поля у объекта.
// Хоть он себя так и ведет. Здесь в примере мы в ECMA модуле подменяем require для
// того чтобы он мог загружать все типы модулей.

const fs = require("fs");
console.log(Object.keys(fs));

console.log({ require });
