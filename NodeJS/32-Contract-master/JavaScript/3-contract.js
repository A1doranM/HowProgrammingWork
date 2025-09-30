"use strict";

// Контракт - это конструкция которая проверяется на определенных этапах,
// например в рантайме.

const assert = require("assert");

const compare = (a, b) => {
  assert(typeof a === "number");
  assert(typeof b === "number");
  const result = a > b;
  assert(typeof result === "boolean");
  return result;
};

{
  const result = compare(7, 5);
  console.log({ result });
}

{
  const result = compare(7, "5");
  console.log({ result });
}
