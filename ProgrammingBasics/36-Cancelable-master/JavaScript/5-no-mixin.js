"use strict";

// Похожий вариант но вместо примешивания мы отдаем объект с методом cancel.

const cancelable = (promise) => {
  let cancelled = false;
  return {
    promise: promise.then((val) => {
      if (cancelled) return Promise.reject(new Error("Canceled"));
      return val;
    }),
    cancel: () => {
      cancelled = true;
    }
  };
};

// Usage

{
  const { cancel, promise } = cancelable(new Promise((resolve) => {
    setTimeout(() => {
      resolve("first");
    }, 10);
  }));

  promise.then(console.log).catch(console.log);
  console.dir({ cancel, promise });
}

{
  const { cancel, promise } = cancelable(new Promise((resolve) => {
    setTimeout(() => {
      resolve("second");
    }, 10);
  }));

  cancel();
  promise.then(console.log).catch(console.log);
  console.dir({ cancel, promise });
}
