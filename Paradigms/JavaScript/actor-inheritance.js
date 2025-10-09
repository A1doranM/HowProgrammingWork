/*
Paradigm: Actor Model via Inheritance (Domain object extends Actor base)

Summary:
- Encapsulates concurrency by having a base Actor with a mailbox (queue) and a processor that
  serializes method calls. A domain class (Point) extends Actor, so its own methods are invoked
  via asynchronous messages rather than direct calls.

When to use:
- Concurrency and isolation: ensure single-threaded access to internal state without locks.
- Decouple callers from implementation by using message passing (send).
- Compose inheritance for domain behavior with cross-cutting actor mechanics.

Trade-offs:
- Message protocol (allowed methods and argument shapes) must be designed and validated.
- Backpressure/queue growth and error handling policies are required in production.
- Async boundaries complicate debugging and error propagation; add tracing/timeouts as needed.

Step-by-step in this code:
1) class Actor: Base with private queue and #processing flag; exposes send and processes messages.
2) Actor.send({ method, args }): Enqueue a message and return a Promise resolved with a method’s result.
3) Actor.#process(): Drain queue sequentially; dispatch to this[method](...args); ensure a single runner.
4) class Point extends Actor: Domain logic with private #x,#y; methods move/clone/toString are invoked via actor messages.
5) Execution:
   - p1 = new Point(10, 20); await p1.send({ method: 'toString' }).
   - Clone by sending 'clone' → c1; move c1; toString again.

Notes:
- Validate method names and argument shapes in send to avoid runtime errors.
- Consider timeouts/cancellation for long-running messages and queue limits for robustness.
*/
'use strict';

 // 1) Base Actor: provides a mailbox and sequential processing of messages
class Actor {
  #queue = [];
  #processing = false;

  // 2) Enqueue a message and trigger processing; resolve with method result
  async send({ method, args = [] }) {
    return new Promise((resolve) => {
      this.#queue.push({ method, args, resolve });
      this.#process();
    });
  }

  // 3) Drain the queue; dispatch to domain methods on `this`
  async #process() {
    if (this.#processing) return;
    this.#processing = true;
    while (this.#queue.length) {
      const { method, args, resolve } = this.#queue.shift();
      if (typeof this[method] === 'function') {
        const result = await this[method](...args);
        resolve(result);
      }
    }
    this.#processing = false;
  }
}

 // 4) Domain class extends Actor; its methods are invoked via send()
class Point extends Actor {
  #x;
  #y;

  // Initialize domain state; Actor base initialized via super()
  constructor(x, y) {
    super();
    this.#x = x;
    this.#y = y;
  }

  // Mutate internal state by deltas
  move(x, y) {
    this.#x += x;
    this.#y += y;
  }

  // Return a new Point (not an Actor-wrapper here; the instance itself is an actor)
  clone() {
    return new Point(this.#x, this.#y);
  }

  // Format current coordinates
  toString() {
    return `(${this.#x}, ${this.#y})`;
  }
}

// Usage

 // 5) Execution: send messages to the actor and await results
const main = async () => {
  const p1 = new Point(10, 20);
  console.log(await p1.send({ method: 'toString' }));
  const c1 = await p1.send({ method: 'clone' });
  await c1.send({ method: 'move', args: [-5, 10] });
  console.log(await c1.send({ method: 'toString' }));
};

main();
