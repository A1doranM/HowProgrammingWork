"use strict";

// Еще пример с динамическим импортом.
const promise = import("node:events");
console.log({ promise });

promise.then((events) => {
  console.log({ defaultMaxListeners: events.defaultMaxListeners });
});
