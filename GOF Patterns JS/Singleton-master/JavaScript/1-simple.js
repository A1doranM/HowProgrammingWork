'use strict';

function Singleton() {
  const { instance } = Singleton;
  if (instance) return instance;
  Singleton.instance = this;
}

// Usage

console.assert(new Singleton() === new Singleton());
console.log('instances are equal');

// But instance is accessible

const a1 = new Singleton();
Singleton.instance = null;
console.log('Remove instance');
const a2 = new Singleton();
if (a1 !== a2) console.log('a1 !== a2');
