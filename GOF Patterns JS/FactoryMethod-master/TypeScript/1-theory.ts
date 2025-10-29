abstract class AbstractCreator {
  abstract factoryMethod(...args: Array<unknown>): AbstractProduct;
}

abstract class AbstractProduct {}

class Product extends AbstractProduct {
  field: string;

  constructor(value: string) {
    super();
    this.field = value;
  }
}

class Creator extends AbstractCreator {
  factoryMethod(value: string): Product {
    return new Product(value);
  }
}

// Usage

const creator = new Creator();
console.dir(creator);
const product = creator.factoryMethod('value');
console.dir(product);
