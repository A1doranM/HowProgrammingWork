'use strict';

const { EventEmitter, once } = require('node:events');

const emitter = new EventEmitter();

const main = async () => {
  const res = await once(emitter, 'name');
  console.log(res);
};

main();

emitter.emit('name', { a: 4 }, { a: 5 }, { a: 6 });
