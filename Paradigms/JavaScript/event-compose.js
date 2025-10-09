/*
Paradigm: Event Composition (Object owns its own EventEmitter)

Summary:
- Each instance composes an EventEmitter and subscribes to its own events to implement behavior.
- Keeps concerns local to the object: the emitter lives with the instance (composition), not global.

When to use:
- You want decoupled interactions but scoped to a single component or instance.
- Per-instance event streams (e.g., UI widgets, domain entities with local events).
- Avoiding global pub/sub while still using event-driven style.

Trade-offs:
- Must manage listener lifecycles per instance to avoid leaks.
- Event-driven flow can obscure control; document event names and payloads clearly.
- No built-in backpressure; consider conventions if events can flood.

Step-by-step in this code:
1) class Point composes an EventEmitter as this.emitter.
2) 'move' subscriber mutates private #x/#y by deltas from payload.
3) 'clone' subscriber creates a new Point and returns it via a provided callback.
4) 'toString' subscriber calls a callback with formatted coordinates.
5) Execution: Create a Point, emit 'toString'; clone to c1; on c1 emit 'toString', 'move', 'toString'.

Notes:
- Event names define the contract; keep payload schema stable and documented.
- Composition keeps events local; prefer this to global emitter when scoping matters.
*/
'use strict';

const { EventEmitter } = require('node:events');

 // 1) Domain class composed with its own EventEmitter
class Point {
  #x;
  #y;

  // Initialize private state and compose emitter; wire subscriptions
  constructor({ x, y }) {
    this.#x = x;
    this.#y = y;
    this.emitter = new EventEmitter();

    // 2) 'move' event: mutate internal state by deltas
    this.emitter.on('move', ({ x, y }) => {
      this.#x += x;
      this.#y += y;
    });

    // 3) 'clone' event: create a new Point and pass it via callback
    this.emitter.on('clone', (callback) => {
      const point = new Point({ x: this.#x, y: this.#y });
      callback(point);
    });

    // 4) 'toString' event: invoke callback with formatted coords
    this.emitter.on('toString', (callback) => {
      callback(`(${this.#x}, ${this.#y})`);
    });
  }
}

// Usage

 // 5) Execution: create instance and emit events via its own emitter
const p1 = new Point({ x: 10, y: 20 });
p1.emitter.emit('toString', console.log);
p1.emitter.emit('clone', (c1) => {
  c1.emitter.emit('toString', console.log);
  c1.emitter.emit('move', { x: -5, y: 10 });
  c1.emitter.emit('toString', console.log);
});
