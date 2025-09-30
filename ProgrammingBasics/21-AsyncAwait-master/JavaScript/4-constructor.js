"use strict";

const DAY_OF_JUDGMENT = Date.now() + Math.floor(Math.random() * 5000);

class Coming {
  constructor() { // Таким образом можно создать асинхронный конструктор.
    return new Promise((resolve) => setTimeout(() => { // Для этого надо из него возвращать промис.
      resolve(this); // Который резолвается с текущим объектом.
    }, DAY_OF_JUDGMENT - Date.now()));
  }
}

(async () => {

  const secondComing = await new Coming();
  console.dir(secondComing);

})();
