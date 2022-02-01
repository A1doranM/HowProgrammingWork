"use strict";

// Пример списка на замыканиях + каррирование.

const node = data => {
  const element = data => { // Возвращаем функцию element,
    const next = node(data); // рекурсивно вызываем ноду и отправляем ей данные, где опять вернется функция element
    next.prev = element; // текущую функцию сохранили в предыдущий элемент
    return next; // возвратили новый element.
  };
  element.data = data; // Сохранили данные.
  return element;
};

/*

const node = (data, element) => (element = Object.assign(
  data => Object.assign(node(data), { prev: element }), { data }
));

*/

// Usage

const obj1 = { name: "first" };
const obj2 = { name: "second" };
const obj3 = { name: "third" };

const list = node(obj1)(obj2)(obj3);

console.dir(list, { depth: 3 });
