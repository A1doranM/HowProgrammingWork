"use strict";

const { PI, sqrt } = Math;
const square = (x) => x * x;

// Reactive Truncated cone

class Cone {
  constructor(r1, r2, h) {
    this.cone = { r1, r2, h };
    this.calculate();
  }
  calculate() {
    const { r1, r2, h } = this.cone;
    const sr1 = square(r1);
    const sr2 = square(r2);
    const l = sqrt(square(h) + square(r2 - r1));
    this.cone.v = PI * h * (sr1 + r1 * r2 + sr2) / 3;
    this.cone.s = PI * (sr1 + sr2 + l * (r1 + r2));
  }
  set r1(x) {
    this.cone.r1 = x;
    this.calculate();
  }
  set r2(x) {
    this.cone.r2 = x;
    this.calculate();
  }
  set h(x) {
    this.cone.h = x;
    this.calculate();
  }
  get v() {
    return this.cone.v;
  }
  get s() {
    return this.cone.s;
  }
}

// Usage

const cone = new Cone(10, 15, 7);
console.dir({ v: cone.v, s: cone.s });
cone.h = 8;
console.dir({ v: cone.v, s: cone.s });
