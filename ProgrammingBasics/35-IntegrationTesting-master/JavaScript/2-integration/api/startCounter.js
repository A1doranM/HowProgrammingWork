"use strict";

// Запускает задачи.

module.exports = async (name, timeout) => {
  let counter = 0;
  scheduler.task(name, timeout, (done) => {
    counter++;
    console.log(`Counter ${name} = ${counter}`);
    done();
  });
  return "ok";
};
