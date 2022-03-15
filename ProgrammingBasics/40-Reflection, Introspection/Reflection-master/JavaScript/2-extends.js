"use strict";

// Более сложное создание динамических класов.

class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

// Категорию отображаем в класс наследующий ее.
const equilateral = (Category) => class extends Category {
  // Вместо изначальных 4 аргументов принимаем 3.
  constructor(x, y, side) {
    // В супер отдаем как и надо 4 аргумента дублируя последний
    // для создания равностороннего треугольника.
    super(x, y, side, side);
  }
};

// Здесь тоже самое но другие свойства добавляются.
// Тоесть мы принимаем на вход некий объект и возвращаем новый
// класс наследующийся от него но с добавлением некоего нового свойства.

const serializable = (Category) => class extends Category {
  toString() {
    return `[${this.x}, ${this.y}, ${this.width}, ${this.height}]`;
  }
};

const measurable = (Category) => class extends Category {
  area() {
    return this.width * this.height;
  }
};

const movable = (Category) => class extends Category {
  move(x, y) {
    this.x += x;
    this.y += y;
  }
};

const scalable = (Category) => class extends Category {
  scale(k) {
    const dx = this.width * k;
    const dy = this.height * k;
    this.width += dx;
    this.height += dy;
    this.x -= dx / 2;
    this.y -= dy / 2;
  }
};

// Utils

const compose = (...fns) => (arg) => (
  fns.reduce((arg, fn) => fn(arg), arg)
);

// Usage
// Теперь можем вот так создавать и конфигурировать классы.
const Square1 = equilateral(serializable(measurable(
  movable(scalable(Rect))
)));

// Аналогичный вызов но с композицией.
const toSquare = compose(
  equilateral, serializable, measurable, movable, scalable
);

const Square2 = toSquare(Rect);

const p1 = new Square2(10, 20, 50);
p1.scale(1.2);
p1.move(-10, 5);
console.log(p1.toString());
console.log("Area:", p1.area());
