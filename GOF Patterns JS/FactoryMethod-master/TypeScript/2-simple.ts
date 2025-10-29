class Product {
  field: string;

  constructor(value: string) {
    this.field = value;
  }
}

class Creator {
  factoryMethod(value: string): Product {
    return new Product(value);
  }
}

// Usage

const creator = new Creator();
console.dir(creator);
const product = creator.factoryMethod('value');
console.dir(product);
