'use strict';

class Product {
  constructor(value) {
    this.field = value;
  }
}

class Creator {
  factoryMethod(...args) {
    return new Product(...args);
  }
}

// Usage

const creator = new Creator();
console.dir(creator);
const product = creator.factoryMethod('value');
console.dir(product);
