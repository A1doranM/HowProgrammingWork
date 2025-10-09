/*
Paradigm: Event Dispatch via Factory-style Constructor (Closure-backed)

Summary:
- Encapsulates state with closures inside a function constructor and exposes a single emit(eventName, payload) API.
- An internal events map routes event names to handlers (move, clone, toString), decoupling callers from concrete functions.

When to use:
- You want a small, stable public surface (emit) and private internal state without classes.
- Decouple invocation (by name) from implementation to enable swapping/extending handlers.
- Prefer functional/closure style while still modeling event/command dispatch.

Trade-offs:
- Event names are strings (or symbols); typos surface at runtime—define clear payload contracts.
- Indirection obscures control flow; document available events and their payload shapes.
- The example calls with 'new' though the function returns its own object; 'new' is unnecessary.

Step-by-step in this code:
1) Point({ x, y }): Factory-style constructor capturing x,y in a closure (private state).
2) move(d): Mutates closed-over x,y by deltas from d.
3) clone(): Creates a new Point with the current snapshot of x,y.
4) toString(): Pure formatter reading closed-over state.
5) events: Internal registry mapping event names to handlers.
6) emit(name, args): Looks up handler by name, validates, and invokes it; returns the result.
7) Execution:
   - Create p1; emit 'toString'.
   - Emit 'clone' to create c1; emit 'toString' on c1.
   - Emit 'move' on c1, then 'toString' again.

Notes:
- Because the function returns an object explicitly, 'new Point(...)' is not required; Point(...) would work the same here.
*/
'use strict';

 // 1) Factory-style constructor: returns an object exposing emit; x,y are private via closure
function Point({ x, y }) {
  // 2) Handler: mutate closed-over state by applying deltas
  const move = (d) => {
    x += d.x;
    y += d.y;
  };
  // 3) Handler: create a new instance (new closure) with current snapshot
  const clone = () => new Point({ x, y });
  // 4) Handler: pure formatter reading private coords
  const toString = () => `(${x}, ${y})`;

  // 5) Internal registry mapping event names to their handlers
  const events = { move, clone, toString };

  // 6) Public dispatcher: resolve handler by name, validate, and invoke
  const emit = (eventName, args) => {
    const event = events[eventName];
    if (!event) throw new Error(`Unknown event: ${event}`);
    return event(args);
  };

  // Expose only the dispatcher, keeping state and handlers private
  return { emit };
}

// Usage

 // 7) Execution: 'new' is not required since Point returns an object explicitly
const p1 = new Point({ x: 10, y: 20 });
console.log(p1.emit('toString'));
const c1 = p1.emit('clone');
console.log(c1.emit('toString'));
c1.emit('move', { x: -5, y: 10 });
console.log(c1.emit('toString'));
