"use strict";

const text = (s = "", o = { // Все точно так же но теперь мы добавили объекту
  line: (a) => (s +=  "\n" + a, o),
  [Symbol.iterator]: () => ({ // итератор с помощью которого по объекту можно пройтись
    next() {                  // операторам ..., или for of, for in, и т.д.
      const res = { value: s, done: this.finished };
      this.finished = true;
      return res;
    }
  })
}) => o;

// Usage

const txt = text("line1")
  .line("line2")
  .line("line3")
  .line("line4");

console.log(...txt);
