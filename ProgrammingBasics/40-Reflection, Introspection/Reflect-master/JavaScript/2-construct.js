"use strict";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const obj1 = new Point(10, 20);
// Вызываем конструктор у переданного класса с аргументами.
const obj2 = Reflect.construct(Point, [10, 20]);

console.dir({ obj1, obj2 });
