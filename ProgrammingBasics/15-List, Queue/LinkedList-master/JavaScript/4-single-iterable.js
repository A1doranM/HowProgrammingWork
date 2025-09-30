"use strict";

// Итеративный подход.
const list = () => {
  let element;
  return { // Возвращаем объект с методами
    push(data) { // для добавления в список
      element = { // при добавлении в element сохраняем текущий добавленный элемент.
        prev: element,
        data: data,
      };
      return element;
    },

    last: () => element, // Получения последнего элемента.

    [Symbol.iterator]: () => ({ // Определяем для него итератор.
      current: element, // Вначале текущий элемент указывает на последний добавленный элемент.
      next() {
        const element = this.current; // Берем текущий элемент.
        if (!element) return {
          done: true,
          value: null
        };
        this.current = element.prev; // Сохраняем в текущий список предок последнего элемента.
        return {
          done: false,
          value: element.data
        };
      }
    })
  };
};

// Usage

const obj1 = { name: "first" };
const obj2 = { name: "second" };
const obj3 = { name: "third" };

const l1 = list();
l1.push(obj1);
l1.push(obj2);
l1.push(obj3);

console.dir(l1.last());

console.dir([...l1]);

for (const element of l1) {
  console.log(element);
}
