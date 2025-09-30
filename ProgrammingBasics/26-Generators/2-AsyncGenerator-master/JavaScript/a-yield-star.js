"use strict";

async function* genFn() {
  yield* [10, 20, 30];
  //yield* new Set([10, 20, 30]);
}

(async () => {
  const c = genFn();
  c.next().then(console.log);
  c.next().then(console.log);
  c.next().then(console.log);
  c.next().then(console.log);
})();
