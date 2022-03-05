"use strict";

const cancelable = (executor) => {
  let canceled = false;

  const promise = new Promise((resolve, reject) => {
    executor((val) => {
      if (canceled) {
        reject(new Error("Cancelled"));
        return;
      }
      resolve(val);
    }, reject);
  });

  promise.cancel = () => {
    canceled = true;
  };

  return promise;
};

// Usage

{
  const promise = cancelable((resolve) => {
    setTimeout(() => {
      resolve("first");
    }, 10);
  });

  promise.then(console.log).catch(console.log);
  console.dir({ promise });
}

{
  const promise = cancelable((resolve) => {
    setTimeout(() => {
      resolve("second");
    }, 10);
  });

  promise.cancel();
  promise.then(console.log).catch(console.log);
  console.dir({ promise });
}
