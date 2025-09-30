"use strict";

// Внутри package.json указанного пакета мы устанавливаем две точки входа,
// одну для require другую для import.

const p6 = require("Package6");
console.log({ p6 });

import("Package6").then((result) => {
  console.log(result);
});
