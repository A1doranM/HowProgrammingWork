'use strict';

const { EventEmitter } = require('node:events');

const emitter = new EventEmitter();

emitter.on('name', (data) => {
  console.dir({ data });
});

emitter.emit('name', { a: 5 });
