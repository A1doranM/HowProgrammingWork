'use strict';

const iterator = {
  counter: 0,
  next() {
    return {
      value: this.counter++, // current value
      done: this.counter > 3 // boolean
    };
  }
};

const step1 = iterator.next();
const step2 = iterator.next();
const step3 = iterator.next();
const step4 = iterator.next();
console.log({ step1, step2, step3, step4 });
