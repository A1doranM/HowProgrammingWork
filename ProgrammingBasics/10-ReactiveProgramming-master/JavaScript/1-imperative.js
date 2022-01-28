"use strict";

// Реактивное программирования это когда у нас есть огромное количество переменных, и изменяя одну
// на ее изменение реагируют другие, поэтому и реактивное программирование.

// Не реактивный пример вычисления усеченного конуса.

const { PI, sqrt } = Math;
const square = (x) => x * x;

// Truncated cone calculations

const volume = (h, r1, r2) => (PI * h / 3) *
  (square(r1) + r1 * r2 + square(r2));

const area = (h, r1, r2) => PI * (
  square(r1) + square(r2) +
  sqrt(square(h) + square(r2 - r1)) * (r1 + r2)
);

// Usage

const cone = { r1: 10, r2: 15, h: 7 };

cone.v = volume(cone.h, cone.r1, cone.r2);
cone.s = area(cone.h, cone.r1, cone.r2);

console.dir(cone);
