"use strict";

const { AsyncResource, executionAsyncId } = require("node:async_hooks");

// Пример с коллекцией умеющей накапливать в себе кусочки данных и вызывать коллбек
// когда такие кусочки накопились.

class AsyncCollector extends AsyncResource {
  constructor(expected, callback) {
    super("collector");
    this.expected = expected;
    this.collection = new Set();
    this.callback = callback;
  }

  add(element) {
    this.collection.add(element);
    if (this.expected === this.collection.size) { // Когда набрали вызываем коллбек.
      this.finish(this.callback);
    }
  }

  finish(callback) {
    const thisArg = null;
    const error = null;
    const data = [...this.collection];
    this.runInAsyncScope(callback, thisArg, error, data);
  }
}

// Usage

const collector = new AsyncCollector(3, (error, data) => {
  const id = executionAsyncId();
  console.log({ id, error, data });
});

collector.add("uno");
collector.add("due");
collector.add("due");
collector.add("tre");
