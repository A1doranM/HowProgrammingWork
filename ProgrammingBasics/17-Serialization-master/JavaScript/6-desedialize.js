"use strict";

const vm = require("vm");

const jstp = `{
  name: "Marcus Aurelius",
  address: { city: "Roma" },
  professions: ["Imperor", "Stoic", "Philosopher"],
  fn: x => x * 2
}`;

const script = vm.createScript(`(${jstp})`);
const data = script.runInThisContext();
console.dir(data);
