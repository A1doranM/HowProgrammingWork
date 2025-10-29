'use strict';

const EventEmitter = require('node:events');
const { setTimeout } = require('node:timers/promises');

const emit = async (ee, name, ...args) => {
  const listeners = ee.listeners(name);
  const promises = listeners.map((f) => f(...args));
  return await Promise.all(promises);
};

const main = async () => {
  const ee = new EventEmitter();
  ee.on('name', async (data) => {
    console.log('Enter event: name', data);
    await setTimeout(1000);
    console.log('Exit event: name');
  });
  await emit(ee, 'name', { value: 1 });
  console.log('Done');
};

main();
