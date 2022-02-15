"use strict";

class Collector {
  constructor(expected) { // number or array of string, count or keys
    this.expectKeys = Array.isArray(expected) ? new Set(expected) : null;
    this.expected = this.expectKeys ? expected.length : expected;
    this.keys = new Set();
    this.count = 0;
    this.timer = null;
    this.doneCallback = () => {};
    this.finished = false;
    this.data = {};
  }

  collect(key, err, value) {
    if (this.finished) return this;
    if (err) {
      this.finalize(err, this.data);
      return this;
    }
    if (!this.keys.has(key)) {
      this.count++;
    }
    this.data[key] = value;
    this.keys.add(key);
    if (this.expected === this.count) {
      this.finalize(null, this.data);
    }
    return this;
  }

  pick(key, value) {
    this.collect(key, null, value);
    return this;
  }

  fail(key, err) {
    this.collect(key, err);
    return this;
  }

  take(key, fn, ...args) {
    fn(...args, (err, data) => {
      this.collect(key, err, data);
    });
    return this;
  }

  timeout(msec) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (msec > 0) {
      this.timer = setTimeout(() => {
        const err = new Error("Collector timed out");
        this.finalize(err, this.data);
      }, msec);
    }
    return this;
  }

  done(callback) {
    this.doneCallback = callback;
    return this;
  }

  finalize(err, data) {
    if (this.finished) return this;
    if (this.doneCallback) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.finished = true;
      this.doneCallback(err, data);
    }
    return this;
  }
}

const collect = (expected) => new Collector(expected);

// Collect

const collector = collect(3)
  .timeout(1000)
  .done((err, result) => {
    console.dir({ err, result });
  });

const sourceForKey3 = (arg1, arg2, callback) => {
  console.dir({ arg1, arg2 });
  callback(null, "key3");
};

collector.collect("key1", null, 1);
collector.pick("key2", 2);
collector.take("key3", sourceForKey3, "arg1", "arg2");
