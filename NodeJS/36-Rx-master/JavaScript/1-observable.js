"use strict";

// RxJS это библиотека использующая паттерн Observer для работы с асинхронностью.
// Не надо везде пихать реактивное программирование с Rx, он хорошо подходит в задачах
// где мы получаем большое количество ивентов  которые приходят например в какой-то стрим, и эти
// события взаимодействуя с друг с другом  генерируют результирующее событие. Например система с кучей
// датчиков на показания которых надо  реагировать, или игра где бегает большое количество игроков.
// Вся асинхронность на Rx будет такой же как если бы мы ее написали на промисах, или async/await, он просто
// поменяет синтаксис, с императивного на реактивный. Это просто разные способы смотреть на одну и туже
// асинхронность.

const { Observable } = require("rxjs"); // Берем Observable из Rx.

const randomChar = () => String
  .fromCharCode(Math.floor((Math.random() * 25) + 97));

// Создаем новый Observable, точно так же как и в нашем Observable из 35-Observer используя паттерн
// открытый конструктор. Отдавая ему функцию принимающую subscriber.
const observable = new Observable((subscriber) => {
  setInterval(() => {
    const char = randomChar();
    subscriber.next(char); // Отправляем событие которое попадет в наш observable.
  }, 200);
});

let count = 0;

const observer = (char) => { // Наблюдатель.
  process.stdout.write(char);
  count++;
  if (count > 50) {
    process.stdout.write("\n");
    process.exit(0);
  }
};

observable.subscribe(observer); // Подписываемся на изменения.

console.dir({ observer, observable });
