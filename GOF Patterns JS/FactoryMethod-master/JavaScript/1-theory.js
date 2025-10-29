'use strict';

class AbstractCreator {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractCreator) {
      throw new Error('Abstract class should not be instanciated');
    }
  }

  factoryMethod() {
    throw new Error('Method is not implemented');
  }
}

class AbstractProduct {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractProduct) {
      throw new Error('Abstract class should not be instanciated');
    }
  }
}

class Product extends AbstractProduct {
  constructor(value) {
    super();
    this.field = value;
  }
}

class Creator extends AbstractCreator {
  constructor() {
    super();
  }

  factoryMethod(...args) {
    return new Product(...args);
  }
}

// Usage

const creator = new Creator();
console.dir(creator);
const product = creator.factoryMethod('value');
console.dir(product);
