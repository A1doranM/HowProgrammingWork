'use strict';

class EventEmitter {
  events = {};

  on(name, fn) {
    const event = this.events[name];
    if (event) event.push(fn);
    else this.events[name] = [fn];
  }

  emit(name, ...data) {
    const event = this.events[name];
    if (!event) return;
    for (const listener of event) listener(...data);
  }
}

const emitter = new EventEmitter();

emitter.on('name', (data) => {
  console.dir({ data });
});

emitter.emit('name', { a: 5 });
