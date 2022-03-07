"use strict";

const PAUSE = 1000;

// Простейшая реализация thenable
const thenable = {
  then(onFulfilled) { // должна иметь метод then и принимать коллбэк.
    setTimeout(onFulfilled, PAUSE);
  }
};

(async () => {
  await thenable;
  console.log("---uno---");
  await thenable;
  console.log("---due---");
  await thenable;
  console.log("---tre---");
  await thenable;
})();
