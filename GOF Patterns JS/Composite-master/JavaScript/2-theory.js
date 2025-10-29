'use strict';

class AbstractProduct {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractProduct) {
      throw new Error('Abstract class should not be instanciated');
    }
  }

  get price() {
    throw new Error('Method is not implemented');
  }
}

class Product extends AbstractProduct {
  constructor(name, price) {
    super();
    this.name = name;
    this.productPrice = price;
  }

  get price() {
    return this.productPrice;
  }
}

class Collection extends AbstractProduct {
  constructor(name, ...products) {
    super();
    this.name = name;
    this.set = new Set(products);
  }

  get price() {
    let price = 0;
    for (const item of this.set) {
      price += item.price;
    }
    return price;
  }
}

// Usage

const p1 = new Product('Laptop', 1500);
const p2 = new Product('Mouse', 25);
const p3 = new Product('Keyboard', 100);
const p4 = new Product('HDMI cable', 10);
const electronics = new Collection('Electronics', p1, p2, p3, p4);

const p5 = new Product('Bag', 50);
const p6 = new Product('Mouse pad', 5);
const textile = new Collection('Textile', p5, p6);

const purchase = new Collection('Purchase', electronics, textile);

console.dir(purchase, { depth: null });
console.log(`Total is ${purchase.price}`);
