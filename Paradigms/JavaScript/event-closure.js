/*
Paradigm: Closure-based Event Dispatch (Event Map inside a Factory)

Summary:
- Encapsulates state with closures and exposes a single emit(eventName, payload) API.
- Handlers are stored in an internal events map, decoupling callers from concrete functions.
- Combines closure-based encapsulation (private x,y) with an event/command dispatch style.

When to use:
- Modular components without classes where you want a small, testable public surface.
- Decouple invocation (by name) from implementation; enable swapping/extending handlers.
- Situations where returning a small command surface (emit) is preferable to many methods.

Trade-offs:
- Event names are strings (or symbols). Typos cause runtime errors; define clear contracts.
- Indirection obscures control flow; document available events and payload shapes.
- Still mutable state inside the closure; use immutability if you need stronger guarantees.

Step-by-step in this code:
1) createPoint({ x, y }): Factory that captures x and y in a closure (private state).
2) move(d): Mutates closed-over x,y by deltas from d.
3) clone(): Returns a new independent closure initialized to current x,y.
4) toString(): Pure formatter that reads closed-over state.
5) events: Internal map of event names to handlers ({ move, clone, toString }).
6) emit(name, args): Looks up the handler by name, validates, and invokes it; returns the result.
7) Execution:
   - Create p1; emit 'toString'.
   - Emit 'clone' to get c1; emit 'toString' on c1.
   - Emit 'move' on c1 and then emit 'toString' again.

Notes:
- Public API is just { emit }, keeping surface area small and behavior swappable.
- Consider namespacing/typing event names and documenting payloads for maintainability.
*/
'use strict';

 // 1) Factory creates a closure with private (x, y) and an event dispatch API
const createPoint = ({ x, y }) => {
  // 2) Event handler: mutate closed-over coordinates by delta
  const move = (d) => {
    x += d.x;
    y += d.y;
  };
  // 3) Event handler: create a new instance (new closed-over state snapshot)
  const clone = () => createPoint({ x, y });
  // 4) Event handler: pure formatter reading private state
  const toString = () => `(${x}, ${y})`;

  // 5) Internal registry of supported events
  const events = { move, clone, toString };

  // 6) Public dispatcher: resolve handler by name, validate, and invoke
  const emit = (eventName, args) => {
    const event = events[eventName];
    if (!event) throw new Error(`Unknown event: ${event}`);
    return event(args);
  };

  // Only expose a single, stable API surface
  return { emit };
};

// Usage

 // 7) Execution: create, format, clone, move the clone, format again
const p1 = createPoint({ x: 10, y: 20 });
console.log(p1.emit('toString'));
const c1 = p1.emit('clone');
console.log(c1.emit('toString'));
c1.emit('move', { x: -5, y: 10 });
console.log(c1.emit('toString'));
