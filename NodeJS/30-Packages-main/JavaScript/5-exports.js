"use strict";

// Внутри Package5 в package.json можно указывать различные точки входа в зависимости от того
// что пытаются импортировать. Здесь мы зададим 2 точки входа, одну для всего пакета, а другую для graph.
// что позволяет подгружать подмодули вместо целого модуля.
// "exports": {
//     ".": "./main.js",
//     "./graph": "./graph.js"
//   }

import("Package5").then((result) => {
  console.log(result);
});

import("Package5/utils").then((result) => {
  console.log(result);
});
