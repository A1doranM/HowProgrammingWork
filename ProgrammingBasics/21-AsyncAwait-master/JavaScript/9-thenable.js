"use strict";

const fs = require("fs");

// Создаем свой кастомный промис реализуя контракт Thenable.
// У такого класса должен быть метод then и resolve.
// Пока что он не асинхронный.
class Thenable {
  constructor() {
    this.thenHandler = null;
    this.next = null;
  }

  then(fn) { // Вот сюда await пришлет функцию которая выполнится когда произойдет событие
    this.fn = fn; // мы эту функцию сохраним в свойство нашего объекта
    const next = new Thenable(); // и создадим еще один экземпляр Thenable()
    this.next = next; // для того что может быть кто-то будет делать цепочку вызовов then
    return next; // создав еще один Thenable возвращаем его.
                 // Фактически получается объект хранящий подписку на то когда случится событие и пустой Thenable, и он
                 // сам еще не зарезолвлен.
  }

  resolve(value) { // Когда мы вызываем thenable.resolve.
    const fn = this.fn; // Сохраняем функцию подписки в переменную
    if (fn) { // проверяем ее наличие
      const next = fn(value); // вызываем ее отдавая значение и получаем ссылку если кто-то делает цепочку then.
      if (next) { // Если есть
        next.then((value) => { // подпишемся у этого объекта на then и у следующего then по цепочку значение придет к нам в value
          this.next.resolve(value); // и мы его зарезолвим при помощи нашего next который у нас был заготовлен в функции then().
        });
      }
    }
  }
}

// Usage

const readFile = (filename) => {
  const thenable = new Thenable();
  fs.readFile(filename, "utf8", (err, data) => { // Читаем файл
    if (err) throw err; // если нет ошибки.
    thenable.resolve(data); // Передаем данные в наш объект. При этом resolve произойдет куда поже чем return ниже.
                            // тоесть сначала неразрешеный thenable вернется в await.
  });
  return thenable; // Возвращаем thenable.
};

(async () => {

  const file1 = await readFile("9-thenable.js"); // await попробует у вернувшегося ему объекта метод then,
                                                         // он его найдет и при помощи then подпишется на то когда произойдет
                                                         //
  console.dir({ length: file1.length });

})();
