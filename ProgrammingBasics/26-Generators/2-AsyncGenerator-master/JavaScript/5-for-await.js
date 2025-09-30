"use strict";

// По асинхронному генератору мы проходимся с помощью for await.
async function* ids(...args) {
  let i = 0;
  while (args.length > i) {
    const id = args[i++];
    if (id === undefined) return;
    yield id;
  }
}

(async () => {
  const id = ids(1011, 1078, 1292, 1731, undefined, 1501, 1550);
  for await (const val of id) {
    console.log({ val });
  }
})();
