/*
Paradigm: Shared Memory + Atomics (Low-level concurrency primitives)

Summary:
- Stores coordinates in a SharedArrayBuffer and manipulates them with Atomics.
- Int32Array provides a typed view over the shared memory; Atomics.add/load ensure
  race-free updates/reads across agents (e.g., worker threads).

When to use:
- Cross-thread shared state with deterministic, lock-free atomic operations.
- Performance-sensitive sections where copying data between workers is too expensive.
- Implementing ring buffers, counters, or simple shared structs.

Trade-offs:
- Complex memory model: requires careful design to avoid subtle data races and livelocks.
- Limited to numeric typed arrays; struct-like layouts must be modeled manually.
- Harder to reason about than message passing; prefer higher-level patterns unless needed.

Step-by-step in this code:
1) createPoint(x, y): Allocates a SharedArrayBuffer and an Int32Array view for two 32-bit ints.
2) Initialize view[0], view[1] with x and y.
3) move(dx, dy): Uses Atomics.add to update coordinates safely (atomic read-modify-write).
4) clone(): Atomically reads x,y with Atomics.load and returns a new independent point.
5) toString(): Atomically reads x,y for a consistent snapshot and formats them.
6) Execution: Create p1, log; clone to c1; move c1; log c1.

Notes:
- SIZE is 8 bytes: two 32-bit integers (2 * 4 bytes). Adjust layout if adding fields.
- All reading/writing must go through Atomics.* to maintain correctness across threads.
- For structured data, consider SharedArrayBuffer with a well-documented memory layout or use message passing instead.
*/
'use strict';

 // 1) Factory allocating shared memory and exposing atomic operations
const createPoint = (x, y) => {
  // 2) Two 32-bit integers (x,y) → 2 * 4 bytes = 8 bytes
  const SIZE = 8;
  // Shared memory region visible to multiple agents (e.g., workers)
  const buffer = new SharedArrayBuffer(SIZE);
  // Typed view to interpret bytes as 32-bit signed integers
  const view = new Int32Array(buffer);
  view[0] = x;
  view[1] = y;
  // 3) Atomic in-place update to avoid data races
  const move = (dx, dy) => {
    Atomics.add(view, 0, dx);
    Atomics.add(view, 1, dy);
  };
  // 4) Snapshot current values atomically and create an independent point
  const clone = () => {
    const x = Atomics.load(view, 0);
    const y = Atomics.load(view, 1);
    return createPoint(x, y);
  };
  // 5) Atomically read and format current coordinates
  const toString = () => {
    const x = Atomics.load(view, 0);
    const y = Atomics.load(view, 1);
    return `(${x}, ${y})`;
  };
  return { move, clone, toString };
};

// Usage

 // 6) Execution: create, log, clone, move clone, log
const p1 = createPoint(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
