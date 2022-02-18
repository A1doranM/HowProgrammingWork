"use strict";
// Немного другой пример
// на вход генератора даем множество аргументов и пока он не встретит undefined отдаем то что нам передали.
function* ids(...args) {
  let i = 0;
  while (args.length > i) {
    const id = args[i++];
    if (id === undefined) return;
    yield id;
  }
}

const id = ids(1011, 1078, 1292, 1731, undefined, 1501, 1550);
let val;
do {
  val = id.next();
  console.log({ val });
} while (!val.done);
