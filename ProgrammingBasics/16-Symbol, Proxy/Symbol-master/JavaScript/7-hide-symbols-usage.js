"use strict";

const hideSymbol = require("./7-hide-symbols.js");

let obj = {
  name: "Marcus Aurelius",
  born: 121,
  [Symbol.for("secret")]: "some secret information",
  [Symbol.for("notsecret")]: "some not secret information",
  get getter() {
    return "GETTER";
  },
  set setter(value) {}
};

console.log("\n\nBEFORE PROXYING:\n\n");

console.log("\x1b[4mfor in:\x1b[0m");
for (const i in obj) {
  console.log(i);
}

console.log("\x1b[4mconsole.log("obj"):\x1b[0m");
console.log(obj);

console.log("\x1b[4mconsole.dir("obj"):\x1b[0m");
console.dir(obj, { showHidden: true, depth: null });

console.log("\x1b[4mObject.getOwnPropertyNames:\x1b[0m");
console.log(Object.getOwnPropertyNames(obj));

console.log("\x1b[4mObject.getOwnPropertySymbols:\x1b[0m");
console.log(Object.getOwnPropertySymbols(obj));

console.log(
  "\x1b[4mconsole.log(Object.getOwnPropertyDescriptor(obj, " +
  "Symbol.for("secret")))\x1b[0m"
);
console.log(Object.getOwnPropertyDescriptor(obj, Symbol.for("secret")));

console.log("\x1b[4mconsole.log(Object.keys(obj)):\x1b[0m");
console.log(Object.keys(obj));

console.log("\x1b[4mconsole.log(obj[Symbol.for("secret")])\x1b[0m");
console.log(obj[Symbol.for("secret")]);

console.log("\x1b[4mconsole.log(Object.entries(obj)):\x1b[0m");
console.log(Object.entries(obj));

Object.defineProperty(obj, "_debugOutputSecretField", {
  enumerable: false,
  get: () => this[Symbol.for("secret")],
  configurable: true
});

// proxying:
obj = hideSymbol(obj, Symbol.for("secret"));

console.log("\n\nAFTER PROXYING:\n\n");

console.log("\x1b[4mfor in:\x1b[0m");
for (const i in obj) {
  console.log(i);
}

console.log("\x1b[4mconsole.log("obj"):\x1b[0m");
console.log(obj);

console.log("\x1b[4mconsole.dir("obj"):\x1b[0m");
console.dir(obj, {
  showHidden: true,
  depth: null
});

console.log("\x1b[4mObject.getOwnPropertyNames:\x1b[0m");
console.log(Object.getOwnPropertyNames(obj));

console.log("\x1b[4mObject.getOwnPropertySymbols:\x1b[0m");
console.log(Object.getOwnPropertySymbols(obj));

console.log(
  "\x1b[4mconsole.log(Object.getOwnPropertyDescriptor(obj, " +
  "Symbol.for("secret")))\x1b[0m"
);
console.log(Object.getOwnPropertyDescriptor(obj, Symbol.for("secret")));

console.log("\x1b[4mconsole.log(Object.keys(obj)):\x1b[0m");
console.log(Object.keys(obj));

console.log("\x1b[4mconsole.log(obj[Symbol.for("secret")])\x1b[0m");
console.log(obj[Symbol.for("secret")]);

console.log("\x1b[4mconsole.log(Object.entries(obj)):\x1b[0m");
console.log(Object.entries(obj));

// overwrite:
console.log("\n\x1b[4m[Symbol.for("secret")] = "overwrite value"\x1b[0m");
obj[Symbol.for("secret")] = "overwrite value";

console.log("\x1b[4mconsole.log("obj"):\x1b[0m");
console.log(obj);

console.log("\x1b[4mObject.getOwnPropertySymbols:\x1b[0m");
console.log(Object.getOwnPropertySymbols(obj));

console.log("\x1b[4mconsole.log(obj[Symbol.for("secret")])\x1b[0m");
console.log(obj[Symbol.for("secret")]);

console.log("\n\nREAL VALUE OF obj[Symbol.for("secret")]:\n\n");
console.log("\x1b[4mconsole.log(obj._debugOutputSecretField):\x1b[0m");
console.log(obj._debugOutputSecretField);
