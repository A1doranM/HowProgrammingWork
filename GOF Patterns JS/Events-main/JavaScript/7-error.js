'use strict';

const { EventEmitter } = require('node:events');

const emitter = new EventEmitter();

emitter.on('error', (data) => {
  console.dir({ data });
});

emitter.emit('error', new Error('Something went wrong'));

const target = new EventTarget();

const event = new CustomEvent('error', {
  detail: new Error('Something went wrong'),
});

target.dispatchEvent(event);

// Hold process for 10s
setTimeout(() => {}, 10000);
