/*
Paradigm: Event Aggregation (Pub/Sub via shared EventEmitter)

Summary:
- Multiple components subscribe to named events on a shared emitter; publishers broadcast via emit().
- Decouples senders from receivers: publishers don’t need direct references to subscribers.

When to use:
- Cross-component coordination, UI updates, logging/analytics, and extensibility points.
- Situations where many listeners react to the same kind of event.

Trade-offs:
- Harder to trace control flow (who triggered what); can lead to “event soup”.
- Broadcast scope must be carefully managed to avoid unintended fan-out and ordering issues.
- Backpressure and error handling are not built-in; design conventions are needed.

Step-by-step in this code:
1) Point subscribes to emitter events ('move' | 'clone' | 'toString'), each handler closes over instance state.
2) 'move' handler: updates this instance’s private #x/#y by the provided deltas.
3) 'clone' handler: creates a new Point with current state and returns it via a callback.
4) 'toString' handler: invokes a callback with a formatted string of current coords.
5) Execution:
   - Create a shared EventEmitter and one Point subscriber.
   - Emit 'toString' to log current point.
   - Emit 'clone' to create a second Point (also subscribed).
   - Emit 'move' and then 'toString' which both subscribers can react to.

Notes:
- Keep emitters scoped (per module/feature) to reduce global coupling.
- Define clear event payload contracts and handler expectations (callbacks vs return values).
*/
'use strict';

const { EventEmitter } = require('node:events');

 // 1) Subscriber class: instances attach handlers to a shared EventEmitter
class Point {
  #x;
  #y;

  // Subscribe instance-specific handlers to shared emitter
  constructor({ x, y }, emitter) {
    this.#x = x;
    this.#y = y;

    // 2) 'move' event: mutate this instance by deltas from payload
    emitter.on('move', ({ x, y }) => {
      this.#x += x;
      this.#y += y;
    });

    // 3) 'clone' event: create a new Point and pass it to the provided callback
    emitter.on('clone', (callback) => {
      const point = new Point({ x: this.#x, y: this.#y }, emitter);
      callback(point);
    });

    // 4) 'toString' event: provide formatted coords via callback
    emitter.on('toString', (callback) => {
      callback(`(${this.#x}, ${this.#y})`);
    });
  }
}

// Usage

 // 5) Execution: create emitter, a point subscriber, then broadcast events
const emitter = new EventEmitter();
const p1 = new Point({ x: 10, y: 20 }, emitter);
emitter.emit('toString', console.log);
emitter.emit('clone', (c0) => {
  emitter.emit('toString', console.log);
  emitter.emit('move', { x: -5, y: 10 });
  emitter.emit('toString', console.log);
});
