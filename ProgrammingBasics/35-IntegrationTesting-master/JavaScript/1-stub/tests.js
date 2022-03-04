"use strict";

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
    clearTimeout(timer);
    scheduler.stopAll();
    next(error);
  });
};

// Execute tests

runner.start([
  testCreateTask,
  testExecuteTask,
  testFailedTask,
]);
