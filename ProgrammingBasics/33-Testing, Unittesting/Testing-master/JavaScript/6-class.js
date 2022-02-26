"use strict";

const assert = require("assert").strict;
const { EventEmitter } = require("events");

class Task extends EventEmitter {
  constructor(name, time, exec) {
    super();
    this.name = name;
    if (typeof time === "number") {
      this.time = Date.now() + time;
      this.set = setInterval;
      this.clear = clearInterval;
    } else {
      this.time = new Date(time).getTime();
      this.set = setTimeout;
      this.clear = clearTimeout;
    }
    this.exec = exec;
    this.running = false;
    this.count = 0;
    this.timer = null;
  }
  get active() {
    return !!this.timer;
  }
  start() {
    this.stop();
    if (this.running) return false;
    const time = this.time - Date.now();
    if (time < 0) return false;
    this.timer = this.set(() => {
      this.run();
    }, time);
    return true;
  }
  stop() {
    if (!this.active || this.running) return false;
    this.clear(this.timer);
    this.timer = null;
    return true;
  }
  run() {
    if (!this.active || this.running) return false;
    this.running = true;
    this.exec(err  => {
      if (err) this.emit("error", err, this);
      this.count++;
      this.running = false;
    });
    return true;
  }
}

class Scheduler extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
  }
  task(name, time, exec) {
    this.stop(name);
    const task = new Task(name, time, exec);
    this.tasks.set(name, task);
    task.on("error", err => {
      this.emit("error", err, task);
    });
    task.start();
    return task;
  }
  stop(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      this.tasks.delete(name);
    }
  }
  stopAll() {
    for (const name of this.tasks.keys()) {
      this.stop(name);
    }
  }
}

// Tests

const testCreateTask = next => {
  const timer = setTimeout(() => {
    const err = new Error("Can not create task");
    assert.fail(err);
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task("name1", "2019-04-16T18:30Z", done => {
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

const testExecuteTask = next => {
  const timer = setTimeout(() => {
    const err = new Error("Can not execute task");
    assert.fail(err);
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task("name1", 100, done => {
    let error = null;
    try {
      assert.ok(scheduler.tasks.get("name1").running);
    } catch (err) {
      error = err;
    }
    clearTimeout(timer);
    done(null, "task successed");
    scheduler.stopAll();
    next(error);
  });
};

const testFailedTask = next => {
  const timer = setTimeout(() => {
    const err = new Error("Task expected to fail");
    assert.fail(err);
    next(err);
  }, 200);

  const scheduler = new Scheduler();

  scheduler.task("name1", 100, done => {
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

const tests = [
  testCreateTask,
  testExecuteTask,
  testFailedTask,
];

let failed = 0;
const count = tests.length;
const runNext = () => {
  if (tests.length === 0) {
    console.log(`Total: ${count}; Failed: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
  }
  const test = tests.shift();
  console.log(`Started test: ${test.name}`);
  try {
    test(err => {
      if (err) {
        failed++;
        console.log(`Failed test: ${test.name}`);
        console.log(err);
      }
      console.log(`Finished test: ${test.name}`);
      setTimeout(runNext, 0);
    });
  } catch (err) {
    failed++;
    console.log(`Failed test: ${test.name}`);
    console.log(err);
    setTimeout(runNext, 0);
  }
};

runNext();
