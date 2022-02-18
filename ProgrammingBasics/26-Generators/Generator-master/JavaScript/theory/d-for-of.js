"use strict";

// Вместо того чтобы бегать через while постоянно вызывая
// next проходимся по генератору с помощью for of.
function* ids(...args) {
  let i = 0;
  while (args.length > i) {
    const id = args[i++];
    if (id === undefined) return;
    yield id;
  }
}

const id = ids(1011, 1078, 1292, 1731, undefined, 1501, 1550);
for (const val of id) { // Будет вызывать next у генератора пока генератор не завершится.
  console.log({ val });
}
