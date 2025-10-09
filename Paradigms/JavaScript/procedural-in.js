/*
Paradigm: Procedural (In/Out Parameters)

Summary:
- Functions operate on caller-provided objects/buffers and write results in place to minimize allocations.
- Data and behavior are separate; the caller manages memory and object lifecycles.

When to use:
- Performance/memory-critical paths and tight loops.
- Environments where allocation/GC is expensive or constrained.
- Interfacing with APIs expecting output parameters or fixed buffers.

Trade-offs:
- Higher risk of aliasing and accidental shared-state mutation.
- Can reduce readability versus returning new objects; requires discipline.

Step-by-step in this code:
1) createPoint(point, x, y): Initializes a provided object with coordinates.
2) clone(src, dest): Copies fields from src into dest (dest is caller-allocated).
3) move(point, dx, dy): Mutates the object in place by adding deltas.
4) toString(point, buffer): Writes formatted string into buffer.value (no new object allocations).
5) Execution flow:
   - Allocate p1 and result buffer objects.
   - Initialize p1; format to result; log.
   - Allocate c1; clone from p1; move c1; format to result; log.

Notes:
- Callers must ensure inputs/outputs aren’t aliased unintentionally.
- Document ownership and mutability contracts to avoid surprises.
*/
'use strict';

 // 1) Initialize caller-provided object with coordinates
const createPoint = (point, x, y) => {
  point.x = x;
  point.y = y;
};

 // 2) Copy fields from src into dest (caller allocates dest)
const clone = (src, dest) => {
  dest.x = src.x;
  dest.y = src.y;
};

 // 3) In-place update by deltas (procedural in/out style)
const move = (point, dx, dy) => {
  point.x += dx;
  point.y += dy;
};

 // 4) Write formatted string into provided buffer.value (avoid allocating new output object)
const toString = (point, buffer) => {
  buffer.value = `(${point.x}, ${point.y})`;
};

// Usage

 // 5) Execution: allocate objects, reuse buffer, clone and move, log results
const p1 = {};
createPoint(p1, 10, 20);
const result = {};
toString(p1, result);
console.log(result.value);
const c1 = {};
clone(p1, c1);
move(c1, -5, 10);
toString(c1, result);
console.log(result.value);
