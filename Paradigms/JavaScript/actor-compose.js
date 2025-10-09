/*
Paradigm: Actor Model (Composed Actor Class)

Summary:
- Encapsulates mutable state inside an Actor that processes messages sequentially via an internal queue.
- Interactions occur through asynchronous send({ method, args }) messages instead of direct method calls.

When to use:
- Concurrency and isolation: serialize access to state without locks.
- Decoupling callers from implementation; message passing can cross async boundaries.
- Systems where actors can spawn/clone other actors to scale out tasks.

Trade-offs:
- Message protocol design (allowed methods, args) and validation are required.
- Need strategies for backpressure (queue growth), errors, and cancellation/timeouts.
- Asynchronous flow can be harder to debug; add tracing/metrics in production.

Step-by-step in this code:
1) class Actor: Wraps an Entity instance; holds a private queue and #processing flag.
2) send({ method, args }): Enqueues a message and returns a Promise resolved with the method’s result.
3) #process(): Drains the queue sequentially; dispatches to Entity methods; ensures a single runner.
4) class Point: Domain logic providing move/clone/toString; clone returns a new Actor(Point,...).
5) Execution:
   - Create p1 = new Actor(Point, 10, 20); send('toString').
   - Clone via send('clone') → c1 (another Actor); move c1; toString again.

Notes:
- Validate messages (method names, arg shapes) and consider queue limits for robustness.
- add timeouts/retries/backoff policies around send for production-grade systems.
*/
'use strict';

 // 1) Actor class: wraps an Entity instance; sequentially processes messages
class Actor {
  #queue = [];
  #processing = false;
  #state = null;

  // Wrap the provided Entity and initialize its instance as private state
  constructor(Entity, ...args) {
    this.#state = new Entity(...args);
  }

  // 2) Enqueue a message and trigger processing; resolve with the result
  async send({ method, args = [] }) {
    return new Promise((resolve) => {
      this.#queue.push({ method, args, resolve });
      this.#process();
    });
  }

  // 3) Drain the mailbox; dispatch to methods on the wrapped Entity instance
  async #process() {
    if (this.#processing) return;
    this.#processing = true;
    while (this.#queue.length) {
      const { method, args, resolve } = this.#queue.shift();
      if (typeof this.#state[method] === 'function') {
        const result = await this.#state[method](...args);
        resolve(result);
      }
    }
    this.#processing = false;
  }
}

 // 4) Domain object whose methods will be invoked by Actor
class Point {
  // Initialize coordinates
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Mutate internal state by deltas
  move(x, y) {
    this.x += x;
    this.y += y;
  }

  // Return a new Actor wrapping a fresh Point snapshot
  clone() {
    return new Actor(Point, this.x, this.y);
  }

  // Format current coordinates
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// Usage

 // 5) Execution: create an actor, send messages, and await responses
const main = async () => {
  const p1 = new Actor(Point, 10, 20);
  console.log(await p1.send({ method: 'toString' }));
  const c1 = await p1.send({ method: 'clone' });
  await c1.send({ method: 'move', args: [-5, 10] });
  console.log(await c1.send({ method: 'toString' }));
};

main();
