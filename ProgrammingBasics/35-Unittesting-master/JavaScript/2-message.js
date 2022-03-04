"use strict";

const assert = require("assert");

const actual = { field1: 100, field2: 200, field3: 300 };
const expected = { field1: 100, field2: 200, field4: 400 };
assert.deepStrictEqual(actual, expected, "Test failed");
