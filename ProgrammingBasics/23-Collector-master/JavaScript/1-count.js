"use strict";

// Коллектор это абстракция которая собирает данные из нескольких источников и когда все данные собранны вызывает
// коллбэк, при этом коллектору так же можно сказать собирать данные только в течении определенного времени, после
// чего будет отдавать ошибку.

const DataCollector = function(expected, timeout, callback) {
  this.expected = expected;
  this.count = 0;
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

DataCollector.prototype.collect = function(key, data) {
  if (this.finished) return;
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
};

// Usage

const dc1 = new DataCollector(3, 1000, (err, result) => {
  console.log("dc1");
  console.dir({ err, result });
});

dc1.collect("key1", 1);
dc1.collect("key2", 2);
dc1.collect("key3", 3);

const dc2 = new DataCollector(3, 1000, (err, result) => {
  console.log("dc2");
  console.dir({ err, result });
});

dc2.collect("key1", 1);
dc2.collect("key2", 2);

const dc3 = new DataCollector(3, 1000, (err, result) => {
  console.log("dc3");
  console.dir({ err, result });
});

dc3.collect("key1", new Error("Collect an error"));
dc3.collect("key2", 2);
dc3.collect("key3", 3);
