"use strict";

// Пул с проверкой того чтобы в него отдавали те классы которые он хранит. А не какие-то левые.

const poolified = Symbol("poolified"); // Символ который помечает элементы пула.

const mixFlag = { [poolified]: true }; // Записываем значение символу.

const duplicate = (factory, n) => (
  new Array(n).fill().map(() => {
    const instance = factory();
    return Object.assign(instance, mixFlag); // Элементам пула добавляем наш символ.
  })
);

const provide = (callback) => (item) => { // Возвращаем функцию которая асинхронно вызывает коллбэк.
  setImmediate(() => {
    callback(item);
  });
};

const poolify = (factory, min, norm, max) => {
  let allocated = norm;
  const items = duplicate(factory, norm);
  const delayed = [];
  return (par) => {
    if (par[poolified]) {
      const request = delayed.shift();
      if (request) request(par);
      else items.push(par);
      return;
    }
    const callback = provide(par);
    if (items.length < min && allocated < max) {
      const grow = Math.min(max - allocated, norm - items.length);
      allocated += grow;
      const instances = duplicate(factory, grow);
      items.push(...instances);
    }
    const res = items.pop();
    if (res) callback(res);
    else delayed.push(callback);
  };
};

// Usage

const adder = (a) => (b) => adder(a + b);

const pool = poolify(adder, 1, 2, 3);

console.log("request Item1");
pool((item1) => {
  console.log("get Item1");
  console.log("request Item2");
  pool((item2) => {
    console.log("get Item2");
    console.log("request Item3");
    pool((item3) => {
      console.log("get Item3");
      setTimeout(() => {
        pool(item3);
        console.log("recycle Item3");
      }, 50);
    });
    console.log("request Item4");
    pool((item4) => {
      console.log("get Item4");
      setTimeout(() => {
        pool(item4);
        console.log("recycle Item4");
      }, 20);
    });
    setTimeout(() => {
      pool(item1);
      console.log("recycle Item1");
      setTimeout(() => {
        pool(item2);
        console.log("recycle Item2");
      }, 10);
    }, 10);
  });
});
