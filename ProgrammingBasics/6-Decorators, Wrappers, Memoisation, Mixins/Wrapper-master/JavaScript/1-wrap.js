"use strict";

// Функции обертки это один из подтипов функций высшего порядка.

// const wrap = f => (...args) => f(...args);

const wrap = (f) => { // Демонстрируем что при помощи функции обертки можно
  console.log("Wrap function:", f.name); // перехватить имя функции
  return (...args) => {
    console.log("Called wrapper for:", f.name);
    console.dir({ args }); // аргументы
    const result = f(...args); // вызов
    console.log("Ended wrapper for:", f.name);
    console.dir({ result }); // результат.
    return result;
  };
};

// Usage

const func = (par1, par2) => {
  console.dir({ par1, par2 });
  return [par1, par2];
};

func("Uno", "Due");
const wrapped = wrap(func);
wrapped("Tre", "Quatro");
