'use strict';

class Product {
  field;
  constructor(value) {
    this.field = value;
  }
}

class Creator {
  factoryMethod(value) {
    return new Product(value);
  }
}

// Usage
const creator = new Creator();
console.dir(creator);
const product = creator.factoryMethod('value');
console.dir(product);
