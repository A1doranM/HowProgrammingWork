'use strict';

// Elements to be visited

class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }

  accept(visitor) {
    visitor.visitProduct(this);
  }

  inStock() {
    return true; // Just a stub
  }
}

class Service {
  static SUNDAY = 0;
  static SATURDAY = 6;

  constructor(name) {
    this.name = name;
  }

  accept(visitor) {
    visitor.visitService(this);
  }

  isAvailableAt(date) {
    const day = date.getDay();
    return day > Service.SUNDAY && day < Service.SATURDAY;
  }
}

// Visitors to be acceped

class Purchase {
  constructor(items, delivery) {
    this.items = [];
    this.delivery = null;
    for (const item of items) {
      this.visitProduct(item);
    }
    this.visitService(delivery);
  }

  visitProduct(product) {
    const available = product.inStock();
    const status = (available ? 'in' : 'out of') + ' stock';
    if (available) this.items.push(product);
    console.log(`Product "${product.name}" is ${status}`);
  }

  visitService(service) {
    const now = new Date();
    const available = service.isAvailableAt(now);
    const status = (available ? '' : 'not ') + 'available';
    if (available) this.delivery = service;
    console.log(`Service "${service.name}" is ${status}`);
  }
}

class Inspection {
  constructor(items) {
    this.items = [...items];
  }

  check() {
    for (const item of this.items) {
      this.visitProduct(item);
    }
  }

  visitProduct(product) {
    const available = product.inStock();
    const status = (available ? 'in' : 'out of') + ' stock';
    console.log(`Product "${product.name}" is ${status}`);
  }

  visitService() {
    throw new Error('Not implemented');
  }
}

// Usage

const p1 = new Product('Laptop', 1500);
const p2 = new Product('Keyboard', 100);
const delivery = new Service('Delivery');
const electronics = new Purchase([p1, p2], delivery);
console.dir({ electronics });

const inspection = new Inspection([p1, p2]);
inspection.check();
