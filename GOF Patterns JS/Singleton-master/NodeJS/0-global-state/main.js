'use strict';

const state = require('./state.js');
const unit1 = require('./unit1.js');
const unit2 = require('./unit2.js');

const INITIAL_STATE = {
  time: Date.now(),
  counter: 0,
};

unit1.restore(INITIAL_STATE);

setInterval(() => {
  state.counter++;
  unit2.show();
  unit1.save();
}, 1000);
