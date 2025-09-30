"use strict";

// TODO: Код по пулам находится в ./NodeJS/31-Pool-master он просто используется еще в уроках по Ноде поэтому он там.

// Фабрика - занимается порождением экземпляров класса, или функции.
// Пул - еще более высокая абстракция которая сразу инстанциирует объекты выдавая некоторое количество готовых
// к работе сущностей. Сущность можно забирать и возвращать в пул.

function userFactory1(name, group, email) { // Простая фабрика объектов.
  return { name, group, email };
}

const userFactory2 = (name, group, email) => ({ // Тоже самое.
  name, group, email
});

const userFactory3 = (name, group, email) => { // Не работает, неправильно написано.
  name, group, email
};

const userFactory4 = (name, group, email) => ( // Не правильно вернется только email, потому что круглые скопки
  name, group, email // принимаются за expression из которого возвращается последний член.
);

const user1 = userFactory1("marcus", "emperors", "marcus@spqr.it");
console.log(user1);

const user2 = userFactory2("marcus", "emperors", "marcus@spqr.it");
console.log(user2);

const user3 = userFactory3("marcus", "emperors", "marcus@spqr.it");
console.log(user3);
// Explain: why undefined

const user4 = userFactory4("marcus", "emperors", "marcus@spqr.it");
console.log(user4);
// Explain: why "marcus@spqr.it"
