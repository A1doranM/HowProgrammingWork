"use strict";

// А теперь делаем так чтобы файлы внутри пакета были по стандарту ECMA скриптов
// но при этом расширение у них было .js, а не .mjs.
// Для этого мы внутри пакета Package4 внутри его файла package.json
// должны указать "type": "module" (по умолчанию "type": "commonjs").

import("Package4").then((result) => {
  console.log(result);
});

import("Package4/utils.js").then((result) => {
  console.log(result);
});
