// import может вести себя и как динамическая функция.

const promise = import("node:events"); // Начинаем загружать.
console.log({ promise });

promise.then((events) => {
  console.log({ defaultMaxListeners: events.defaultMaxListeners }); // А как загрузится то получим результат.
});

const events = await import("node:events"); // Ну, или черей авейт.
console.log({ defaultMaxListeners: events.defaultMaxListeners });
