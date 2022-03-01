"use strict";

// Проверяем с какой скоростью происходит инстанциирование функций.
// Читаем README.md для того чтобы понять все нужные для тестов условия.
const benchmark = require("./2-benchmark.js");

const makeClosure = (hello, size, flag) => () => (
  { hello, size, flag }
);

// Инстанциирование через замыкание.
const closureInstance = () => makeClosure("world", 100500, true);

// Инстанциирование через массив.
const defineArray = () => ["world", 100500, true];

// Инстанциирование массива строк.
const defineArrayOfString = () => ["world", "world", "world"];

// Массива чисел.
const defineArrayOfNumber = () => [100500, 100500, 100500];

const defineObject = () => ({
  hello: "world",
  size: 100500,
  flag: true
});

const mixinObject = () => {
  const obj = {};
  obj.hello = "world";
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

function ProtoItem(hello, size, flag) {
  this.hello = hello;
  this.size = size;
  this.flag = flag;
}

// Инстанциирование прототипа
const newPrototype = () => new ProtoItem("world", 100500, true);

const ClassItem = class {
  constructor(hello, size, flag) {
    this.hello = hello;
    this.size = size;
    this.flag = flag;
  }
};

const newClass = () => new ClassItem("world", 100500, true);

const newObject = () => {
  const obj = new Object();
  obj.hello = "world";
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

const objectCreate = () => {
  const obj = Object.create(null);
  obj.hello = "world";
  obj.size = 100500;
  obj.flag = true;
  return obj;
};

const itemFactory = (hello, size, flag) => ({ hello, size, flag });

const callFactory = () => itemFactory("world", 100500, true);

benchmark.do(1000000, [
  callFactory,
  closureInstance,
  defineObject,
  defineArray,
  defineArrayOfString,
  defineArrayOfNumber,
  mixinObject,
  newPrototype,
  newClass,
  newObject,
  objectCreate
]);
