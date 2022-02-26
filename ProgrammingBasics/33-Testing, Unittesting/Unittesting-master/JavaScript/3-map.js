"use strict";

const assert = require("assert");

const actual = new Map([["field1", 100], ["field2", 200], ["field3", 300]]);
const expected = new Map([["field1", 100], ["field2", 200], ["field4", 400]]);
console.dir({ actual, expected });
assert.deepStrictEqual(actual, expected);
