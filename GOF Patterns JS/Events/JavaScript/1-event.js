'use strict';

// Node.js v19.0.0
// or v18.7.0, v16.17.0 behind --experimental-global-customevent

const target = new EventTarget();

target.addEventListener('name', (event) => {
  console.log({ event });
  console.log({ data: event.detail });
});

const event = new CustomEvent('name', {
  detail: { id: 100, city: 'Roma', country: 'Italy' },
});

target.dispatchEvent(event);
