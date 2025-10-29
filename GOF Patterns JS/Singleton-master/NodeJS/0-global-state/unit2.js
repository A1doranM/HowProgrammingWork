'use strict';

const state = require('./state.js');

const show = () => {
  console.table(state);
};

module.exports = { show };
