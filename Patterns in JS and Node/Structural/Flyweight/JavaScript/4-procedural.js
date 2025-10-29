'use strict';

// Note: this implementation is good for JavaScript culture
// but it is not Flyweight (GoF Patterns) implementation

const timers = new Map();

const free =
  ({ listeners, instance, interval }) =>
  (callback) => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      clearInterval(instance);
      timers.delete(interval);
    }
  };

const interval = (interval, callback) => {
  let timer = timers.get(interval);
  if (timer) return timer;
  const listeners = new Set();
  const instance = setInterval(() => {
    timer.listeners.forEach((callback) => callback());
  }, interval);
  timer = { listeners, instance, interval };
  timers.set(interval, timer);
  listeners.add(callback);
  return Object.assign(timer, { remove: free(timer) });
};

module.exports = interval;
