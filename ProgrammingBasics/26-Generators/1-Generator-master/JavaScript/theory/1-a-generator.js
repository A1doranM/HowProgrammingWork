"use strict";

// Generator function

// Объявление функции генератора. Генератор это функция которая по ходу роботы может несколько раз вернуть значение,
// обычные значения он возвращает через yield, а завершается возвращая return.
function* genFn(x) {
  yield x * 2;
  return x * 3;
}

console.log("genFn =", [genFn]); //
console.log("genFn.toString() =", [genFn.toString()]);
console.log("typeof genFn =", typeof genFn);
const fnProto = Object.getPrototypeOf(genFn);
console.log("fnProto.constructor.name =", fnProto.constructor.name);

console.log("typeof genFn(5) =", typeof genFn(5));
console.log("genFn(5).toString() =", genFn(5).toString());
const genProto = Object.getPrototypeOf(genFn(5));
console.log("genProto =", genProto);
console.log("genProto[Symbol.iterator] =", genProto[Symbol.iterator]);

console.log("genFn(5) =", genFn(5));
console.log("genFn(5).next() =", genFn(5).next());
console.log("genFn(5).next().value =", genFn(5).next().value);

// Generator class method

class Multiplier {
  constructor(k) {
    this.value = k;
  }

  * genMethod(a) { // Создаем метод - генератор у класса.
    this.value = this.value * a;
    return this.value;
  }
}

const m1 = new Multiplier(2);
console.log("m1.genMethod(5).next() =", m1.genMethod(5).next());

// Generator object field

const m2 = { // Создаем объект у которого будт
  value: 2,

  * genMethod(a) {
    yield this.value;
    this.value = this.value * a;
    return this.value;
  }
};

console.log("m2.genMethod(5).next() =", m2.genMethod(5).next());
