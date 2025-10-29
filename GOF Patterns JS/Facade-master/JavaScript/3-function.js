'use strict';

const timeoutCollection = (interval) => {
  const collection = new Map();
  const timers = new Map();

  const instance = {};

  instance.set = (key, value) => {
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    const timeout = setTimeout(() => {
      collection.delete(key);
    }, interval);
    timeout.unref();
    collection.set(key, value);
    timers.set(key, timer);
  };

  instance.get = (key) => collection.get(key);

  instance.delete = (key) => {
    const timer = timers.get(key);
    if (timer) {
      clearTimeout(timer);
      collection.delete(key);
      timers.delete(key);
    }
  };

  instance.toArray = () => [...collection.entries()];

  return instance;
};

// Usage

const hash = timeoutCollection(1000);
hash.set('uno', 1);
console.dir({ array: hash.toArray() });

hash.set('due', 2);
console.dir({ array: hash.toArray() });

setTimeout(() => {
  hash.set('tre', 3);
  console.dir({ array: hash.toArray() });

  setTimeout(() => {
    hash.set('quattro', 4);
    console.dir({ array: hash.toArray() });
  }, 500);
}, 1500);
