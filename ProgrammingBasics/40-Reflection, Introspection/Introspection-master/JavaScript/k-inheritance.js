"use strict";

const inheritance = (instance, parents = []) => {
  const parent = Object.getPrototypeOf(instance);
  parents.push(parent.constructor.name);
  if (Object.getPrototypeOf(parent)) return inheritance(parent, parents);
  return parents;
};

// Usage

class Cancelable extends Promise {
  constructor(executor) {
    super((resolve, reject) => {
      executor(val => {
        if (this.canceled) {
          reject(new Error("Cancelled"));
          return;
        }
        resolve(val);
      }, reject);
    });
    this.canceled = false;
  }

  cancel() {
    this.canceled = true;
  }
}

const promise = new Cancelable(resolve => {
  setTimeout(() => {
    resolve("first");
  }, 10);
});

console.log(inheritance(promise));
