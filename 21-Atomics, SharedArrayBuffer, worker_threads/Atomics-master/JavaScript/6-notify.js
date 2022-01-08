"use strict";

const threads = require("worker_threads");
const { Worker } = threads;

// Atomics.notify(typedArray, index, count)

if (threads.isMainThread) {
  const buffer = new SharedArrayBuffer(40);
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const array = new Int32Array(workerData);
  if (threadId === 1) {
    setTimeout(() => {
      Atomics.store(array, 5, 100);
      Atomics.notify(array, 5);
    }, 1000);
  } else {
    const res = Atomics.wait(array, 5, 0);
    console.dir({ res });
  }
}
