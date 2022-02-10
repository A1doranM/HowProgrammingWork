"use strict";

// Функтор на замыканиях.

function maybe(x) {
  return function(fn) { // Возвращаем функцию которая замыкает в себе fn и делает тоже самое что и Map до этого.
    if (x && fn) {
      return maybe(fn(x));
    } else {
      return maybe(null);
    }
  };
}

// Usage

maybe(5)()(console.log);
maybe(5)((x) => ++x)(console.log);
maybe(5)((x) => x * 2)(console.log);
maybe(null)((x) => x * 2)(console.log);
maybe(5)((x) => x * 2)((x) => ++x)(console.log);
