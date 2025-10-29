'use strict';

const unit1 = require('./unit1.js');
const unit2 = require('./unit2.js');

setTimeout(() => {
  unit2();
  const res = unit1();
  console.log({ res });
}, 100);
