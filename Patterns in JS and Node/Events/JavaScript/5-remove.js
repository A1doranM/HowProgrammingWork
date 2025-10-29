'use strict';

const EventEmitter = require('node:events');

// EventTarget

const target = new EventTarget();

const targetHandler = (event) => {
  console.log({ data: event.detail });
};

target.addEventListener('name', targetHandler);
target.addEventListener('name', targetHandler);
target.addEventListener('name', targetHandler);
target.removeEventListener('name', targetHandler);

const event = new CustomEvent('name', {
  detail: { id: 100, city: 'Roma', country: 'Italy' },
});

target.dispatchEvent(event);

// EventEmitter

const emitter = new EventEmitter();

const emitterHandler = (data) => {
  console.dir({ data });
};

emitter.on('name', emitterHandler);
emitter.on('name', emitterHandler);
emitter.on('name', emitterHandler);

emitter.removeListener('name', emitterHandler);
emitter.emit('name', { a: 4 });

emitter.removeListener('name', emitterHandler);
emitter.emit('name', { a: 5 });

emitter.removeListener('name', emitterHandler);
emitter.emit('name', { a: 6 });

emitter.removeAllListeners('name');
