"use strict";

// Переписанный вариант где само оборачивание мы выносим за наверх, а два параметра
// определяют что сделать до выполнения функции и что сделать после.
const wrap = (before, after, f) =>  {
  return (...args) => {
    return after(f(...before(...args)));
  };
}

// Usage

const func = (par1, par2) => {
  console.dir({ par1, par2 });
  return [par1, par2];
};

const before = (...args) => { // Делает что-то до вызова функции и должна вернуть аргументы функции.
  console.log("before");
  return args;
};

const after = (res) => { // Делает что-то после вызова функции и должна вернуть ее результат.
  console.log("after");
  return res;
};

const wrapped = wrap(before, after, func);
const res = wrapped("Uno", "Due");
console.dir({
  res,
  func: func.length,
  wrapped: wrapped.length,
});
