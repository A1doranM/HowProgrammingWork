class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Line {
  public a: Point;
  public b: Point;

  get length() {
    const { a, b } = this;
    if (!a || !b) return 0;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    return distance;
  }
}

// Usage

const line = new Line();
line.a = new Point(0, 0);
line.b = new Point(10, 10);
console.log({ line });
console.log("Length:", line.length);
