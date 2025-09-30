"use strict";

// Линзы - в функциональном программировании аналог геттеров и сеттеров.
// Первый вызов передает проперти которая будет храниться в замыкании, а второй вызов рабочий который
// выполняет свой функционал.
const getter = (prop) => (obj) => obj[prop];
const setter = (prop) => (val, obj) => ({ ...obj, [prop]: val }); // Сеттер возвращает новый объект в который скопированы
                                                                  // все поля старого и добавлено новое.

const lens = (getter, setter) => ({ // Линза которая на вход принимает функции которые возвращает геттер и сеттер.
  get: (obj) => getter(obj),
  set: (val, obj) => setter(val, obj),
});

// Usage

const nameLens = lens(getter("name"), setter("name"));

console.dir({ nameLens });
