"use strict";

// Останавливает задачи.

module.exports = async (name) => {
  const res = scheduler.stop(name);
  if (res) {
    console.log(`Counter ${name} is stopped`);
    return "ok";
  } else {
    console.log(`Counter ${name} is not found`);
    return "not found";
  }
};
