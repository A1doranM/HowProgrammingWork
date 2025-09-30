// Пример с динамическим импортом. Обычный импорт на самом деле возвращает промис.

const promise = import("events");
console.log({ promise });

promise.then((events) => {
  console.log({ defaultMaxListeners: events.defaultMaxListeners });
});

const events = await import("events");
console.log({ defaultMaxListeners: events.defaultMaxListeners });
