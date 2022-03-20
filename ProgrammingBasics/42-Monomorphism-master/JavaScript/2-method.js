"use strict";

// Пример с функцией которая у всего подряд вызывает toString.

const stringify = obj => obj.toString();

console.log(stringify(10)); // 1-форма.
console.log(stringify("ten")); // 2-форма.
console.log(stringify(false)); // 3-форма.

{
  const point = {
    x: 10,
    y: 20,
    toString() {
      return [this.x, this.y];
    }
  };

  console.log(stringify(point)); // 4-форма.
}

{
  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    toString() {
      return [this.x, this.y];
    }
  }

  const point = new Point(30, 40);
  console.log(stringify(point)); // 5-форма.
}
