// import может вести себя и как динамическая функция.
// Кстати динамические импорты имеют свой отдельный кэш так что
// модуль загруженный одним способом будет меть другую ссылку чем модуль загруженный вторым.

const promise = import("node:events"); // Начинаем загружать.
console.log({ promise });

promise.then((events) => {
  console.log({ defaultMaxListeners: events.defaultMaxListeners }); // А как загрузится то получим результат.
});

const events = await import("node:events"); // Ну, или черей авейт.
console.log({ defaultMaxListeners: events.defaultMaxListeners });
