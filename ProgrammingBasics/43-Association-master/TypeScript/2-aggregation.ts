class Point {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Line {
  readonly a: Point;
  readonly b: Point;

  constructor(p1: Point, p2: Point) {
    this.a = p1;
    this.b = p2;
  }

  get length() {
    const { a, b } = this;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    return distance;
  }
}

// Usage

const p1 = new Point(0, 0);
const p2 = new Point(10, 10);
const line = new Line(p1, p2);
console.log({ line });
console.log("Length:", line.length);
