"use strict";

// Прокси некоторая функция которая принимает данные для записи,
// и внутри себя осуществляет запись в хранилище данных.

const start = data => {
  console.log("\nstart transaction");
  let delta = {}; // Разница базового и транзакционного объекта.
  const commit = () => {
    console.log("\ncommit transaction");
    Object.assign(data, delta); // При коммите мы переносим поля из дельты в данные и очищаем дельту.
    delta = {};
  };
  return new Proxy(data, { // Возвращаем проксированный объект дельта у которого есть два перехватчика гет и сет.
    get(target, key) {
      if (key === "commit") return commit;
      if (delta.hasOwnProperty(key)) return delta[key]; // Проверяем у дельты есть ли поле которое запросили, если есть читаем его, а если нету то читаем из таргета, это наш объект дата.
      return target[key];
    },
    set(target, key, val) {
      console.log("set", key, val);
      if (target[key] === val) delete delta[key]; // Если значение которое мы хотим установить уже установленно удаляем его их дельты так как нечего менять
      else delta[key] = val; // иначе, присваиваем значение в дельту и возвращаем true, при таком возврате перехватчик считает что все установленно.
      return true;
    }
  });
};

// Usage

const data = { name: "Marcus Aurelius", born: 121 };

console.log("data.name", data.name);
console.log("data.born", data.born);

const transaction = start(data);

transaction.name = "Mao Zedong"; // Данные изменяются только в объекте транзации но не в самом хранилище
transaction.born = 1893;

console.log("data.name", data.name);
console.log("data.born", data.born);

console.log("transaction.name", transaction.name);
console.log("transaction.born", transaction.born);

transaction.commit(); // После коммита транзакции данные перепишутся в хранилище данных.

console.log("data.name", data.name);
console.log("data.born", data.born);

console.log("transaction.name", transaction.name);
console.log("transaction.born", transaction.born);
