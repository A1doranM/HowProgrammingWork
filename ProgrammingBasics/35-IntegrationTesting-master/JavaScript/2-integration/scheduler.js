"use strict";

const { EventEmitter } = require("events");
const { Logger } = require("./logger.js");

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
    this.emit("stop", this);
    return true;
  }

  run() {
    if (!this.active || this.running) return false;
    this.running = true;
    this.emit("begin", this);
    this.exec((err, res) => {
      this.count++;
      this.emit("end", res, this);
      this.running = false;
      if (err) this.emit("error", err, this);
    });
    return true;
  }
}

class Scheduler extends EventEmitter {
  constructor() {
    super();
    this.tasks = new Map();
    this.logger = new Logger();
  }

  task(name, time, exec) {
    this.stop(name);
    const task = new Task(name, time, exec);
    this.tasks.set(name, task);
    task.on("error", (err) => {
      this.logger.error(`${name}\t${err.message}`);
      this.emit("error", err, task);
    });
    task.on("begin", () => {
      this.logger.info(`${name}\tbegin`);
    });
    task.on("end", (res = "") => {
      this.logger.info(`${name}\tend\t${res}`);
    });
    task.on("stop", () => {
      this.logger.info(`${name}\tstop`);
    });
    task.start();
    return task;
  }

  stop(name) {
    const task = this.tasks.get(name);
    if (!task) return false;
    task.stop();
    this.tasks.delete(name);
    return true;
  }

  stopAll() {
    for (const name of this.tasks.keys()) {
      this.stop(name);
    }
  }
}

module.exports = { Scheduler };
