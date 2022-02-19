"use strict";

async function* counter(begin, end, delta) {
  let value = begin;
  let nextValue = begin + delta;
  while (true) {
    value = nextValue;
    nextValue += delta;
    if (nextValue > end) return value;
    const back = yield value;
    if (back) {
      value += back;
      nextValue += back;
      if (nextValue > end) return;
    }
  }
}

const c = counter(0, 180, 12);
c.next().then(console.log);
c.next().then(console.log);
c.next(150).then(console.log);
c.next().then(console.log);
