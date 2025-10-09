/*
Paradigm: Shared Memory + Atomics with a Class Wrapper

Summary:
- Encapsulates coordinates in a SharedArrayBuffer and manipulates them atomically via an Int32Array view.
- The class allocates shared memory per instance and uses Atomics to perform race-free updates across agents.

When to use:
- Cross-thread shared state where lock-free atomic operations are desired (e.g., worker_threads).
- Performance-sensitive scenarios where copying data between workers is expensive.
- Simple struct-like data layouts that can be expressed as typed arrays.

Trade-offs:
- Requires careful memory layout design (manual field offsets and sizes).
- Limited to numeric typed arrays; complex schemas are cumbersome.
- Reasoning about concurrency is harder than message passing; prefer higher-level patterns unless needed.

Step-by-step in this code:
1) class Point: Defines SIZE = 8 bytes (two 32-bit ints) and allocates SharedArrayBuffer per instance.
2) constructor(x, y, view?): Creates a new buffer and view; either copies an existing view's contents or initializes with x,y.
3) move(dx, dy): Uses Atomics.add on indices 0 and 1 to update coordinates atomically.
4) clone(): Creates a new Point with its own shared buffer by copying the current view (independent instance).
5) toString(): Uses Atomics.load to atomically read the current coordinates and format them.
6) Execution: Create p1, log; clone to c1 (independent buffer); move c1; log c1.

Notes:
- SIZE = 8 because we store two 32-bit integers (2 × 4 bytes).
- Always use Atomics.* when reading/writing the shared view across agents to maintain consistency.
*/
'use strict';

 // 1) Class wrapper over SharedArrayBuffer + Atomics for two 32-bit coordinates
class Point {
  static SIZE = 8;

  // 2) Allocate a fresh shared buffer; copy from existing view or initialize with provided coords
  constructor(x, y, view = null) {
    const buffer = new SharedArrayBuffer(Point.SIZE);
    this.view = new Int32Array(buffer);
    if (view) {
      this.view.set(view);
    } else {
      this.view[0] = x;
      this.view[1] = y;
    }
  }

  // 3) Atomic in-place update of (x, y) using Atomics.add
  move(x, y) {
    Atomics.add(this.view, 0, x);
    Atomics.add(this.view, 1, y);
  }

  // 4) Create a new Point with its own buffer by copying current view's contents
  clone() {
    return new Point(0, 0, this.view);
  }

  // 5) Atomically read a consistent snapshot of coordinates for formatting
  toString() {
    const x = Atomics.load(this.view, 0);
    const y = Atomics.load(this.view, 1);
    return `(${x}, ${y})`;
  }
}

// Usage

 // 6) Execution: create, log, clone (independent), move clone, log
const p1 = new Point(10, 20);
console.log(p1.toString());
const c1 = p1.clone();
c1.move(-5, 10);
console.log(c1.toString());
