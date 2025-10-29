'use strict';

const singleton = ((instance) => () => instance)({});

// Usage

console.assert(singleton() === singleton());
console.log('instances are equal');
