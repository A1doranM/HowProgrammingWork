'use strict';

class AbstractCreator {}

class AbstractProduct {}

class Product extends AbstractProduct {
  field;
  constructor(value) {
    super();
    this.field = value;
  }
}

class Creator extends AbstractCreator {
  factoryMethod(value) {
    return new Product(value);
  }
}

// Usage
const creator = new Creator();
console.dir(creator);
const product = creator.factoryMethod('value');
console.dir(product);
