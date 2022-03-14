"use strict";

{
  const promise = new Promise((resolve) => resolve(5));
  console.dir({ promise });
}

{
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve(5);
    }, 1000);
  });
  console.dir({ promise });
  promise.then((x) => console.log({ x }));
  setTimeout(() => {
    promise.then((y) => console.log({ y }));
  }, 1500);
}
