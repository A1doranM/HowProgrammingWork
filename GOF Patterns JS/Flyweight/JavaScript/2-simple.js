'use strict';

class Interval {
  static timers = new Map();

  constructor(interval, callback) {
    let timer = Interval.timers.get(interval);
    if (!timer) {
      this.interval = interval;
      this.listeners = new Set();
      this.instance = setInterval(() => {
        for (const callback of this.listeners.values()) {
          callback();
        }
      }, interval);
      Interval.timers.set(interval, this);
      timer = this;
    }
    timer.listeners.add(callback);
  }

  remove(callback) {
    this.listeners.delete(callback);
    if (this.listeners.size === 0) {
      clearInterval(this.instance);
      Interval.timers.delete(this.interval);
    }
  }
}

// Usage

const COUNT = 1000000;
for (let i = 0; i < COUNT; i++) {
  new Interval(1000, () => {});
  new Interval(2000, () => {});
}
const memory = process.memoryUsage();
console.log({ memory });
