/*
Paradigm: Actor Model (Message Passing with Mailbox)

Summary:
- Encapsulates state within an actor and interacts solely via asynchronous messages.
- Serializes state access through a mailbox/queue to avoid shared-state races and locks.

When to use:
- Concurrency, isolation, and scalability via message passing.
- Avoiding mutexes/locks by ensuring single-threaded processing per actor.
- Distributed systems or UI/background separation via commands/messages.

Trade-offs:
- Requires designing a message protocol and handling backpressure/queue growth.
- Async boundaries add complexity (error handling, retries, timeouts).
- State is still mutable inside the actor; invariants must be enforced by handlers.

Step-by-step in this code:
1) class Point: Private state (#x, #y) plus mailbox (#queue) and a #processing flag.
2) #move/#clone/#toString: Internal operations not exposed directly.
3) send(message): Public API; enqueues a message and returns a Promise for the result.
4) #process(): Drains the queue sequentially; dispatches to internal methods; ensures only one processor runs.
5) Execution flow:
   - Create p1; request toString via send(...) and await.
   - Clone p1 by sending a 'clone' message; mutate the clone with a 'move' message; toString it.

Notes:
- Design messages as a stable protocol; consider message versioning for evolution.
- Consider queue size and backpressure strategies for production use.
*/
'use strict';

 // 1) Actor with private state and mailbox; processes messages sequentially
class Point {
  #x;
  #y;
  #queue = [];
  #processing = false;

  // 2) Initialize private coordinates
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  // 3) Internal op: mutate coordinates (not externally callable)
  #move(x, y) {
    this.#x += x;
    this.#y += y;
  }

  // 4) Internal op: create a new actor with a snapshot of current state
  #clone() {
    return new Point(this.#x, this.#y);
  }

  // 5) Internal op: format current state as a string
  #toString() {
    return `(${this.#x}, ${this.#y})`;
  }

  // 6) Public API: enqueue a message and return a Promise for the result
  async send(message) {
    return new Promise((resolve) => {
      this.#queue.push({ ...message, resolve });
      this.#process();
    });
  }

  // 7) Mailbox processor: ensures only one consumer drains the queue at a time
  async #process() {
    if (this.#processing) return;
    this.#processing = true;
    while (this.#queue.length) {
      const { method, x, y, resolve } = this.#queue.shift();
      if (method === 'move') resolve(this.#move(x, y));
      if (method === 'clone') resolve(this.#clone());
      if (method === 'toString') resolve(this.#toString());
    }
    this.#processing = false;
  }
}

// Usage

 // 8) Execution: send messages to the actor and await results
const main = async () => {
  const p1 = new Point(10, 20);
  console.log(await p1.send({ method: 'toString' }));
  const c1 = await p1.send({ method: 'clone' });
  await c1.send({ method: 'move', x: -5, y: 10 });
  console.log(await c1.send({ method: 'toString' }));
};

main();
