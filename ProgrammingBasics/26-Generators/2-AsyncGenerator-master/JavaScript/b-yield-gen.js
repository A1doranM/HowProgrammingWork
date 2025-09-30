"use strict";

async function* gen1() {
  yield 10;
  yield 20;
  yield 30;
}

async function* gen2() {
  yield 40;
  yield 50;
  yield 60;
}

async function* genFn() {
  yield* gen1();
  yield* gen2();
}

(async () => {
  const c = genFn();
  const val1 = await c.next();
  const val2 = await c.next();
  const val3 = await c.next();
  const val4 = await c.next();
  const val5 = await c.next();
  const val6 = await c.next();
  const val7 = await c.next();
  console.log({ val1, val2, val3, val4, val5, val6, val7 });
})();
