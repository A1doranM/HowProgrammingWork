"use strict";

const getter = (prop) => (obj) => obj[prop];
const setter = (prop) => (val, obj) => ({ ...obj, [prop]: val });

const view = (lens, obj) => lens.get(obj);

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
