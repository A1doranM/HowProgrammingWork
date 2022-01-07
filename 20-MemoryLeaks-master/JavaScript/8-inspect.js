"use strict";

let k = 0;

const collection = {};

// С помощью консольной команды --inspect можно вести профилирование процесса.
// Нода в таком случае создаст вебсокет канал куда будет слать отладочную инфу.

setInterval(() => {
  k++;
  const key = "globalVariable" + k;
  collection[key] = new Array(1000).fill(key);
}, 5);
