'use strict';

const createIO = (effect) => ({
  map: (fn) => createIO(() => fn(effect())),
  chain: (fn) => createIO(() => fn(effect()).run()),
  run: () => effect(),
});

const createPoint = (x, y) => ({
  map: (fn) => {
    const coord = fn(x, y);
    return createPoint(coord.x, coord.y);
  },
  chain: (fn) => fn(x, y),
});

const createTransform = (fn) => ({
  ap: (point) => point.map(fn),
});

const move = (dx, dy) => (x, y) => ({ x: x + dx, y: y + dy });
const cloneP = (x, y) => ({ x, y });
const toString = (x, y) => createIO(() => `(${x}, ${y})`);

// Usage

const p1 = createPoint(10, 20);
p1.chain(toString).map(console.log).run();

const c0 = p1.map(cloneP);
const t1 = createTransform(move(-5, 10));
const c1 = t1.ap(c0);

c1.chain(toString).map(console.log).run();
