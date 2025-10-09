/*
Paradigm: DOM-style Event Target (EventTarget + Custom Events)

Summary:
- Uses a built-in EventTarget to subscribe to named events and dispatch CustomEvent-like objects.
- Decouples producers and consumers: components emit events; listeners react without tight coupling.

When to use:
- Browser/DOM contexts (and modern runtimes) where EventTarget/Event are available.
- UI components, widgets, or modules communicating via events.
- Need multiple listeners per event and simple bubbling/capture semantics (in DOM).

Trade-offs:
- Control flow is implicit; debugging can be harder if events are overused.
- Event payloads are loosely typed unless you define clear contracts (detail shape).
- Reentrancy and ordering should be considered; EventTarget does not provide backpressure.

Step-by-step in this code:
1) PointEvent extends Event: Custom event carrying a detail payload object.
2) Point holds private coords and an EventTarget instance as a message hub.
3) 'move' listener: updates internal #x/#y by deltas from event.detail.
4) 'clone' listener: creates a new Point and returns it via event.detail.callback.
5) 'toString' listener: invokes event.detail.callback with formatted coords.
6) emit(type, detail): Helper that dispatches a PointEvent with the given detail.
7) Execution: Create a Point; emit 'toString', then 'clone' and operate on the clone via events.

Notes:
- Define a clear schema for event.detail to keep consumers in sync.
- Scope EventTarget instances per component to avoid global coupling.
*/
'use strict';

 // 1) Custom Event subclass to carry domain-specific detail payload
class PointEvent extends Event {
  constructor(type, detail = {}) {
    super(type);
    this.detail = detail;
  }
}

 // 2) Domain object using EventTarget to publish/subscribe its own events
class Point {
  #x;
  #y;

  // Initialize private state and wire event listeners
  constructor({ x, y }) {
    this.#x = x;
    this.#y = y;
    this.target = new EventTarget();

    // 3) 'move' listener: mutate internal state using deltas from detail
    this.target.addEventListener('move', (event) => {
      const { x: dx, y: dy } = event.detail;
      this.#x += dx;
      this.#y += dy;
    });

    // 4) 'clone' listener: create a new Point and pass it via callback in detail
    this.target.addEventListener('clone', (event) => {
      event.detail.callback(new Point({ x: this.#x, y: this.#y }));
    });

    // 5) 'toString' listener: call provided callback with formatted coords
    this.target.addEventListener('toString', (event) => {
      event.detail.callback(`(${this.#x}, ${this.#y})`);
    });
  }

  // 6) Helper to dispatch strongly-named events with a payload
  emit(type, detail = {}) {
    this.target.dispatchEvent(new PointEvent(type, detail));
  }
}

// Usage

 // 7) Execution: create a point and interact with it via events
const p1 = new Point({ x: 10, y: 20 });
p1.emit('toString', { callback: console.log });
p1.emit('clone', {
  callback: (c1) => {
    c1.emit('toString', { callback: console.log });
    c1.emit('move', { x: -5, y: 10 });
    c1.emit('toString', { callback: console.log });
  },
});
