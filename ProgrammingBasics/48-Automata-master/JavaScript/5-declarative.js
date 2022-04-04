"use strict";

// Декларативный парсер.

class ArrayLiteralParser {
  constructor(meta) {
    this.state = "start";
    this.meta = meta;
  }

  feed(char) {
    const cases = this.meta[this.state]; // Считываем что делать с состоянием.
    for (const [key, to] of Object.entries(cases)) { // Проходимся по условиям и
      if (key.includes(char)) { // проверяем если текущий ключ подходит под входящий символ то исполняем
        if (typeof to === "string") throw Error(to); // если прислали строку бросаем исключение
        to(this, char);  // или выполняем функцию перехода в следующее состояние.
        return;
      }
      if (key === "") throw Error(to);
    }
  }

  parse(string) {
    for (const char of string) this.feed(char);
    return this.result;
  }
}

// Usage

const parser = new ArrayLiteralParser({ // Описываем состояния парсера
  start: { // Старт
    "[": (target) => { // На открытие скобочки делаем вот такие действия.
      target.result = []; // Результат
      target.value = ""; // значение
      target.state = "value"; // следующее состояние.
    },
    "": "Unexpected character before array", // Если пустой символ.
  },
  value: { // Если значение.
    " .-0123456789": (target, char) => target.value += char, // Если один из этих сомволов делаем вот такое.
    ",]": (target, char) => { // Если скобочка, или запятая
      const value = parseFloat(target.value); // если запятая
      target.result.push(value);
      target.value = "";
      if (char === "]") target.state = "end"; // если скобка перейти на завершение работы.
    },
    "": "Unexpected character in value", // Если пустой символ.
  },
  end: {
    "": "Unexpected character after array", // Если пустой символ.
  },
});

const array = parser.parse("[5, 7.1, -2, 194.5, 32]");
console.log({ array });
