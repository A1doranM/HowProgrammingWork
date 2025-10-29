'use strict';

const singleton = (() => {
  const instance = {};
  return () => instance;
})();

// Usage

console.assert(singleton() === singleton());
console.log('instances are equal', singleton());
