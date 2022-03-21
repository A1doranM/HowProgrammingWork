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

  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.a = new Point(x1, y1);
    this.b = new Point(x2, y2);
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

const line = new Line(0, 0, 10, 10);
console.log({ line });
console.log("Length:", line.length);
