"use strict";

const symbol1 = Symbol("name");

console.log("typeof =", typeof symbol1);

const obj1 = { // Делаем объект с двумя одинаковыми ключами name
  name: "Marcus", // при обычных ключах второй ключ перетрет первый.
  name: "Aurelius",
  [Symbol("name")]: "Marcus", // А символы все уникальны и не перетирают друг друга.
  [Symbol("name")]: "Aurelius",
  [Symbol("name")]: Symbol("value"),
};
const key = Symbol("name"); // Конструкция Symbol("name") на самом деле под капотом создает новый символ
                                      // со значением name.
obj1[key] = "Antoninus"; // Поэтому тут мы не сохраним в существующий Symbol("name") новое значение, а добавим новый
console.log("obj1[key] =", obj1[key]); // символ с новым значением.
console.dir(obj1);
console.log("typeof =", typeof obj1);

console.log({ keys: Object.keys(obj1) });
for (const key in obj1) { // for in не проходит по символам объекта, только по обычным полям.
  console.log("Key in obj1:", key);
  console.log("value:", obj1[key]);
}
