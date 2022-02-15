"use strict";

const KeyCollector = function(keys, timeout, callback) {
  this.expected = keys.length;
  this.count = 0;
  this.keys = keys;
  this.data = {};
  this.finished = false;
  this.doneCallback = callback;
  this.timer = setTimeout(() => {
    if (this.finished) return;
    const err = new Error("Collector timed out");
    this.finished = true;
    this.doneCallback(err);
  }, timeout);
};

KeyCollector.prototype.collect = function(key, data) {
  if (this.finished) return;
  if (this.keys.includes(key)) {
    if (Object.prototype.hasOwnProperty.call(this.data, key)) return;
    this.count++;
    if (data instanceof Error) {
      this.finished = true;
      this.doneCallback(data);
      return;
    }
    this.data[key] = data;
    if (this.expected === this.count) {
      if (this.timer) clearTimeout(this.timer);
      this.finished = true;
      this.doneCallback(null, this.data);
    }
  }
};

// Usage

const kc1 = new KeyCollector(["key1", "key2", "key3"], 1000, (err, result) => {
  console.log("kc1");
  console.dir({ err, result });
});

kc1.collect("key1", 1);
kc1.collect("key2", 2);
kc1.collect("key3", 3);

const kc2 = new KeyCollector(["key1", "key2", "key3"], 1000, (err, result) => {
  console.log("kc2");
  console.dir({ err, result });
});

kc2.collect("key1", 1);
kc2.collect("key2", 2);
kc2.collect("key4", 4);

const kc3 = new KeyCollector(["key1", "key2", "key3"], 1000, (err, result) => {
  console.log("kc3");
  console.dir({ err, result });
});

kc3.collect("key1", new Error("Collect an error"));
kc3.collect("key2", 2);
kc3.collect("key3", 3);
