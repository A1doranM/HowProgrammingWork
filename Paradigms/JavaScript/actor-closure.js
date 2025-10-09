/*
Paradigm: Actor Model via Closure-based Factory

Summary:
- Encapsulates state inside an actor created by a factory (createActor) and interacts via asynchronous messages.
- Each actor has a private message queue and a processor to serialize method invocations, avoiding shared-state races.

When to use:
- Concurrency and isolation: process one message at a time without explicit locks.
- Decoupling callers from direct method calls; use message passing (send) instead.
- Composing systems where actors clone or spawn other actors to scale work.

Trade-offs:
- Message protocols (shape, allowed methods) must be designed and validated.
- Backpressure/queue growth and error handling need careful treatment.
- Async boundaries increase complexity around retries, timeouts, and cancellation.

Step-by-step in this code:
1) createActor(Entity, ...args): Wraps an instance of Entity with a private mailbox (queue) and provides send/process.
2) process(): Drains messages sequentially; dispatches to methods on the internal Entity instance; ensures only one runner.
3) send({ method, args }): Enqueues a message and returns a Promise resolving with the method result.
4) Point: Domain class with move/clone/toString. clone returns a new actor wrapping a fresh Point.
5) Execution:
   - p1 = createActor(Point, 10, 20); send toString.
   - Clone via send('clone') to get c1 (another actor); send move; send toString again.

Notes:
- Design message schema (method names, arg lists) and consider validating method existence.
- For production, consider backpressure (queue size limits) and failure policies (rejecting, retries).
*/
'use strict';

 // 1) Factory: wrap an Entity instance with a private mailbox and async send API
const createActor = (Entity, ...args) => {
  const queue = [];
  let processing = false;
  const state = new Entity(...args);

  // 2) Mailbox processor: drain queue; ensure only a single active loop
  const process = async () => {
    if (processing) return;
    processing = true;
    while (queue.length) {
      const { method, args, resolve } = queue.shift();
      if (typeof state[method] === 'function') {
        const result = await state[method](...args);
        resolve(result);
      }
    }
    processing = false;
  };

  // 3) Public API: enqueue a message { method, args } and resolve with result
  const send = async ({ method, args = [] }) =>
    new Promise((resolve) => {
      queue.push({ method, args, resolve });
      process();
    });

  return { send, process };
};

 // 4) Domain class used as the actor's internal state
class Point {
  // Initialize point coordinates
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Mutate coordinates by deltas (will be called via actor messages)
  move(x, y) {
    this.x += x;
    this.y += y;
  }

  // Produce a new actor wrapping a cloned Point
  clone() {
    return createActor(Point, this.x, this.y);
  }

  // Format coordinates as a string
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// Usage

 // 5) Execution: interact with the actor via send() messages
const main = async () => {
  const p1 = createActor(Point, 10, 20);
  console.log(await p1.send({ method: 'toString' }));
  const c1 = await p1.send({ method: 'clone' });
  await c1.send({ method: 'move', args: [-5, 10] });
  console.log(await c1.send({ method: 'toString' }));
};

main();
