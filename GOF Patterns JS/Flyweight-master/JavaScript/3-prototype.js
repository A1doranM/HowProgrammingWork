'use strict';

class Interval {
  static timers = new Map();

  constructor(interval, callback) {
    this.callback = callback;
    const timer = Interval.timers.get(interval);
    if (timer) {
      Object.setPrototypeOf(this, timer);
    } else {
      this.interval = interval;
      this.listeners = new Set();
      this.instance = setInterval(() => {
        for (const callback of this.listeners.values()) {
          callback();
        }
      }, interval);
      Interval.timers.set(interval, this);
    }
    this.listeners.add(this.callback);
  }

  remove() {
    this.listeners.delete(this.callback);
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
