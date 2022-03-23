"use strict";

// Функция которая берет все ключи из второго объекта и которые
// являются его own property (Object.keys). И добавляем эти ключи
// в первый объект.

const extend = (obj, mixin) => {
  const keys = Object.keys(mixin);
  for (const key of keys) {
    obj[key] = mixin[key];
  }
  return obj;
};

// Usage

const obj1 = {
  name: "Marcus Aurelius",
  city: "Rome",
  born: "121-04-26",
};

const mix1 = {
  toString() {
    return `${this.name} was born in ${this.city} in ${this.born}`;
  },
  age() {
    const year = new Date().getFullYear();
    const born = new Date(this.born).getFullYear();
    return year - born;
  }
};

extend(obj1, mix1);
console.log(obj1);
console.log(obj1.toString());
console.log(`His age is ${obj1.age()} as of today`);
