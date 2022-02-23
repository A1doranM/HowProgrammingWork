"use strict";

// Функция over принимает на вход поле, функцию через которую надо отобразить поле и объект с этим полем.

const getter = (prop) => (obj) => obj[prop];
const setter = (prop) => (val, obj) => ({ ...obj, [prop]: val });

const over = (lens, map, obj) => lens.set(map(lens.get(obj)), obj); // Тут мы сначала смотрим через линзу на объект
                                                                    // потом это поле отобразим через map, а дальше
                                                                    // у линзы вызываем set устанавливая поле объекту.
                                                  // То есть тут сначала считали lens.get(obj) потом к результату
                                                  // применили map() который нам передали и потом результат map
                                                  // установили объекту.

const lens = (getter, setter) => ({
  get: (obj) => getter(obj),
  set: (val, obj) => setter(val, obj),
});

// Usage

const person = {
  name: "Marcus Aurelius",
  city: "Rome",
  born: 121,
};

const nameLens = lens(getter("name"), setter("name"));

const upper = (s) => s.toUpperCase();

console.log("over name:", over(nameLens, upper, person));
