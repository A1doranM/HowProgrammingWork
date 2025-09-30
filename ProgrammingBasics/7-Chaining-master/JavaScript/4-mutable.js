"use strict";

// Точно такой же пример

const text = (s = "", o = { // В аргумент О устанавливаем дефолтное значение и
  line: (a) => (s += "\n" + a, o),
  toString: () => s
}) => o; // из функции возвращаем ссылку на объект О.

// Usage

const txt = text("line1")
  .line("line2")
  .line("line3")
  .line("line4");

console.log(`${txt}`);
