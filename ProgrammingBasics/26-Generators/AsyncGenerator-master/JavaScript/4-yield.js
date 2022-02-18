"use strict";

async function* counter(begin, end, delta) {
  let value = begin;
  let nextValue = begin + delta;
  while (true) {
    value = nextValue;
    nextValue += delta;
    if (nextValue > end) return value;
    else yield value;
  }
}

const c = counter(0, 30, 12);
console.log(c);
c.next().then(console.log);
c.next().then(console.log);
c.next().then(console.log);
c.next().then(console.log);
