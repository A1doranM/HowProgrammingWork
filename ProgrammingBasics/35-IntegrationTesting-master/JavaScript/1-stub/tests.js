"use strict";

// Собираем модули вместе. Каждый тест оборачиваем в функцию.
// Здесь мы будет тестировать скедулер который описывался в других уроках.
// После теста надо приводить процесс в то состояние в котором он был
// до исполнения теста. Тоесть снять все таймеры, убрать обработчики событий.

// Тесты запускаются по возрастанию нагрузки, вначале простые, потом все
// сложнее и сложнее.

const assert = require("assert");
const { Scheduler } = require("./scheduler.js");
const runner = require("./runner.js");

// Tests

const testCreateTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error("Can not create task");
    assert.fail(err);
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task("name1", "2019-04-16T18:30Z", (done) => {
    done(null, "task successed");
  });

  let error = null;
  try {
    assert.strictEqual(scheduler.tasks.size, 1);
  } catch (err) {
    error = err;
  } finally {
    clearTimeout(timer);
    next(error);
  }
};

const testExecuteTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error("Can not execute task");
    assert.fail(err);
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task("name1", 100, (done) => {
    let error = null;
    try {
      assert.ok(scheduler.tasks.get("name1").running);
    } catch (err) {
      error = err;
    } finally {
      clearTimeout(timer);
      done(null, "task successed");
      scheduler.stopAll();
      next(error);
    }
  });
};

const testFailedTask = (next) => {
  const timer = setTimeout(() => {
    const err = new Error("Task expected to fail");
    assert.fail(err);
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task("name1", 100, (done) => {
    done(new Error("Task failed"));
  });

  scheduler.on("error", (err, task) => {
    let error = null;
    try {
      assert.ok(task.running);
      assert.strictEqual(err.message, "Task failed");
    } catch (err) {
      error = err;
    }
    clearTimeout(timer); // Очищаем таймер.
    scheduler.stopAll(); // Останавливаем все планировщики возвращая среду в изначальное состояние.
    next(error);
  });
};

// Execute tests

runner.start([
  testCreateTask,
  testExecuteTask,
  testFailedTask,
]);
