/*
Paradigm: Event Map / Command Dispatch inside a Class

Summary:
- Encapsulates behavior behind a named event/command map (dictionary of handlers).
- Consumers invoke functionality by emitting an event name with a payload, decoupling callers from concrete methods.

When to use:
- You want a stable public surface (event names) that can route to evolving implementations.
- Implement pluggable commands/handlers or feature flags by swapping entries in the map.
- Helpful for testing/mocking by replacing specific handlers.

Trade-offs:
- Event names are strings (unless further typed); misspellings surface at runtime.
- Indirection can hide control flow; ensure good documentation for available events and payload shapes.

Step-by-step in this code:
1) class Point: Holds private state (#x, #y) and an internal #events map of handlers.
2) constructor({x, y}): Initializes state and sets handlers for 'move', 'clone', and 'toString'.
3) emit(eventName, args): Looks up a handler by name, validates, and invokes it with args; returns result.
4) Execution:
   - Create p1 and emit 'toString'.
   - Emit 'clone' to create c1; emit 'toString' on c1.
   - Emit 'move' on c1 and then emit 'toString' on c1 again.

Notes:
- Define clear payload contracts per event to avoid ambiguity.
- You can extend behavior by adding new keys/handlers to #events without changing the public API.
*/
'use strict';

 // 1) Domain class exposing an internal event map for decoupled operations
class Point {
  #x;
  #y;
  #events;

  // 2) Initialize private state and an events map with handlers
  constructor({ x, y }) {
    this.#x = x;
    this.#y = y;
    this.#events = {
      move: ({ x, y }) => {
        this.#x += x;
        this.#y += y;
      },
      clone: () => new Point({ x: this.#x, y: this.#y }),
      toString: () => `(${this.#x}, ${this.#y})`,
    };
  }

  // 3) Dispatcher: route event name to handler; validate; pass args; return handler result
  emit(eventName, args) {
    const event = this.#events[eventName];
    if (!event) throw new Error(`Unknown event: ${eventName}`);
    return event(args);
  }
}

// Usage

 // 4) Execution: use event names to invoke behavior
const p1 = new Point({ x: 10, y: 20 });
console.log(p1.emit('toString'));

const c1 = p1.emit('clone');
console.log(c1.emit('toString'));

c1.emit('move', { x: -5, y: 10 });
console.log(c1.emit('toString'));
