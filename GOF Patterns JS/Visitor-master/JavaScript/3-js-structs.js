'use strict';

// Elements to be visited

const product = (name, price) => {
  const instance = { type: 'Product', name, price };
  instance.accept = (visitor) => {
    const inStock = true; // Just a stub
    visitor(instance, inStock);
  };
  return instance;
};

const SUNDAY = 0;
const SATURDAY = 6;

const service = (name) => {
  const instance = { type: 'Service', name };
  instance.accept = (visitor) => {
    const day = new Date().getDay();
    const available = day > SUNDAY && day < SATURDAY;
    visitor(instance, available);
  };
  return instance;
};

// Visitors to be acceped

const purchase = (items, delivery) => {
  const instance = { items: [], delivery: null };
  const visit = (item, available) => {
    const status = `${available ? '' : 'not '}available`;
    console.log(`${item.type} "${item.name}" is ${status}`);
    if (item.type === 'Service') instance.delivery = item;
    else instance.items.push(item);
  };
  for (const item of items) {
    item.accept(visit);
  }
  delivery.accept(visit);
  return instance;
};

const inspection = (items) => {
  const products = [...items];
  const visit = (item, available) => {
    const status = `${available ? 'in' : 'aut of'} stock`;
    console.log(`${item.type} "${item.name}" is ${status}`);
  };
  const check = () => {
    for (const item of products) {
      item.accept(visit);
    }
  };
  return { items: products, check };
};

// Usage

const p1 = product('Laptop', 1500);
const p2 = product('Keyboard', 100);
const delivery = service('Delivery');
const electronics = purchase([p1, p2], delivery);
console.dir({ electronics });

const stockInspection = inspection([p1, p2]);
stockInspection.check();
