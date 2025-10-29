'use strict';

// Facade that wraps Map and Node.js Timers to provide a simple interface for a
// collection with values that have expiration timeout.

const TimeoutCollection = function (timeout) {
  this.timeout = timeout;
  this.collection = new Map();
  this.timers = new Map();
};

TimeoutCollection.prototype.set = function (key, value) {
  const timer = this.timers.get(key);
  if (timer) clearTimeout(timer);
  const timeout = setTimeout(() => {
    this.delete(key);
  }, this.timeout);
  timeout.unref();
  this.collection.set(key, value);
  this.timers.set(key, timeout);
};

TimeoutCollection.prototype.get = function (key) {
  return this.collection.get(key);
};

TimeoutCollection.prototype.delete = function (key) {
  const timer = this.timers.get(key);
  if (timer) {
    clearTimeout(timer);
    this.collection.delete(key);
    this.timers.delete(key);
  }
};

TimeoutCollection.prototype.toArray = function () {
  return [...this.collection.entries()];
};

// Usage

const hash = new TimeoutCollection(1000);
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
