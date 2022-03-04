"use strict";

const assert = require("assert");
const { api } = require("./client.js");
const runner = require("./runner.js");
const server = require("./server.js");

// Tests

const testStart = (next) => { // Тестируем запуск счетчика.
  const timer = setTimeout(() => {
    const err = new Error("Can not start counter");
    assert.fail(err);
    next(err);
  }, 200);

  const req = api.startCounter("name1", 100);
  assert.ok(req);
  req.then((res) => {
    assert.strictEqual(res, "ok");
    clearTimeout(timer);
    setTimeout(next, 150);
  });
};

const testStop = (next) => { // Тестируем остановку счетчика.
  const timer = setTimeout(() => {
    const err = new Error("Can not stop counter");
    assert.fail(err);
    next(err);
  }, 200);

  const req = api.stopCounter("name1");
  assert.ok(req);
  req.then((res) => {
    assert.strictEqual(res, "ok");
    clearTimeout(timer);
    setTimeout(next, 150);
  });
};

const testStopUnknown = async (next) => { // Тестирование остановки несуществующего счетчика
  const timer = setTimeout(() => {
    const err = new Error("Can not stop counter");
    assert.fail(err);
    next(err);
  }, 200);

  const res = await api.stopCounter("name2");
  assert.strictEqual(res, "not found");
  clearTimeout(timer);
  setTimeout(next, 150);
};

// Execute tests
// Собираем тесты в массив.
const tests = [
  testStart,
  testStop,
  testStopUnknown,
];

(async () => {
  await server.start();
  runner.start(tests);
})();
