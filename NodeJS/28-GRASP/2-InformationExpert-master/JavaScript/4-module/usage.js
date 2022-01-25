"use strict";

const ring = require("./ring.js");

const buf = ring.alloc(10);
ring.write(buf, "1");
ring.write(buf, "23");
ring.write(buf, "4567890A");
console.log(ring.read(buf));
