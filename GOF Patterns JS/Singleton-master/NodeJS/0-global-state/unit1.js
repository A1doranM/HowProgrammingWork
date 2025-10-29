'use strict';

const fs = require('node:fs').promises;
const state = require('./state.js');

const fileName = './state.json';

const save = async () => {
  const data = JSON.stringify(state);
  await fs.writeFile(fileName, data);
};

const restore = async (initialState) => {
  try {
    const data = await fs.readFile(fileName);
    const stored = JSON.parse(data);
    Object.assign(state, stored);
  } catch {
    Object.assign(state, initialState);
  }
};

module.exports = { save, restore };
