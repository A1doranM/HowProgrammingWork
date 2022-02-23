"use strict";

const getter = (prop) => (obj) => obj[prop];
const setter = (prop) => (val, obj) => ({ ...obj, [prop]: val });

const view = (lens, obj) => lens.get(obj);
const set = (lens, val, obj) => lens.set(val, obj);
const over = (lens, map, obj) => lens.set(map(lens.get(obj)), obj);

const lens = (getter, setter) => ({
  get: (obj) => getter(obj),
  set: (val, obj) => setter(val, obj),
});

// Usage

const person = {
  name: "Marcus Aurelius",
  city: "Rome",
  born: 121,
};

const nameLens = lens(getter("name"), setter("name"));

console.log("view name:", view(nameLens, person));

console.log("set name:", set(nameLens, "Marcus", person));

const upper = (s) => s.toUpperCase();
console.log("over name:", over(nameLens, upper, person));
