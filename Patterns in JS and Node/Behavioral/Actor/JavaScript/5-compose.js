'use strict';

/**
 * FILE PURPOSE: Advanced Actor Pattern - Method Dispatch & Composition
 *
 * This file demonstrates an advanced Actor implementation that:
 * 1. Wraps any entity class (composition over inheritance)
 * 2. Dispatches method calls to the wrapped entity
 * 3. Returns results via Promises (request-reply pattern)
 * 4. Enables actor-based programming for any domain object
 *
 * COMPARISON TO 4-actor.js:
 * - 4-actor.js: Actor with single behavior function
 * - 5-compose.js: Actor that wraps entities and dispatches methods
 *
 * This is closer to Erlang/Akka style actor systems where actors
 * are generic message processors.
 */

/**
 * Generic Actor class that wraps any entity
 *
 * DESIGN PATTERN: Composition + Proxy
 * - Composes with any class (Entity)
 * - Proxies method calls through message passing
 * - Maintains serialized access to entity methods
 *
 * KEY DIFFERENCES from 4-actor.js:
 * 1. Wraps an entity instance instead of storing raw state
 * 2. Messages specify method name + arguments
 * 3. Returns results via Promise resolution
 * 4. More generic and reusable
 */
class Actor {
  #queue = [];          // Message queue
  #processing = false;  // Processing flag
  #state = null;        // Wrapped entity instance

  /**
   * Create actor wrapping an entity instance
   *
   * @param {Class} Entity - The class to instantiate
   * @param {...any} args - Constructor arguments for Entity
   *
   * Example:
   *   const actor = new Actor(Point, 10, 20);
   *   // Creates: this.#state = new Point(10, 20)
   */
  constructor(Entity, ...args) {
    this.#state = new Entity(...args);
  }

  /**
   * Send a method call message to the actor
   *
   * MESSAGE FORMAT:
   * {
   *   method: string,    // Method name to call on entity
   *   args: array        // Arguments to pass to method
   * }
   *
   * RETURNS: Promise that resolves with method's return value
   *
   * This enables request-reply pattern:
   *   const result = await actor.send({ method: 'toString' });
   *
   * @param {Object} message - {method, args}
   * @returns {Promise} - Resolves with method's return value
   */
  async send({ method, args = [] }) {
    return new Promise((resolve) => {
      // Queue message with its resolver
      this.#queue.push({ method, args, resolve });
      this.#process(); // Trigger processing (note: NOT awaited here)
    });
  }

  /**
   * Process queued method calls sequentially
   *
   * KEY FEATURES:
   * 1. Sequential execution (same as 4-actor.js)
   * 2. Method dispatch to wrapped entity
   * 3. Result resolution for request-reply pattern
   *
   * IMPORTANT: Method execution is NOT awaited
   * - If entity methods are async, results resolve immediately
   * - For true async support, would need: await this.#state[method](...args)
   */
  async #process() {
    if (this.#processing) return;
    this.#processing = true;
    
    while (this.#queue.length) {
      const { method, args, resolve } = this.#queue.shift();
      
      // Check if method exists on entity
      if (typeof this.#state[method] === 'function') {
        // Call method on wrapped entity
        const result = this.#state[method](...args);
        // Resolve promise with result
        resolve(result);
      }
      // Note: Could add reject() for error handling
    }
    
    this.#processing = false;
  }
}

/**
 * Example Domain Entity: Point in 2D space
 *
 * This is a regular class with no knowledge of actors.
 * Actor wrapper makes it thread-safe for concurrent access.
 */
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Move point by delta
   * Mutates internal state (x, y)
   */
  move(x, y) {
    this.x += x;
    this.y += y;
  }

  /**
   * Clone this point as a new actor
   *
   * INTERESTING: Returns another Actor wrapping a new Point
   * This demonstrates actor composition and hierarchy
   */
  clone() {
    return new Actor(Point, this.x, this.y);
  }

  /**
   * String representation
   */
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// ===========================
// Usage Example
// ===========================

const main = async () => {
  // Create actor wrapping Point(10, 20)
  const p1 = new Actor(Point, 10, 20);
  
  /**
   * Message 1: Call toString()
   * - Queued and processed
   * - Returns "(10, 20)"
   */
  console.log(await p1.send({ method: 'toString' }));
  // Output: (10, 20)
  
  /**
   * Message 2: Call clone()
   * - Creates new Actor wrapping Point(10, 20)
   * - Returns the new actor
   */
  const c1 = await p1.send({ method: 'clone' });
  
  /**
   * Message 3: Call move(-5, 10) on cloned actor
   * - Modifies clone's state: (10, 20) → (5, 30)
   * - Original p1 unchanged
   */
  await c1.send({ method: 'move', args: [-5, 10] });
  
  /**
   * Message 4: Call toString() on cloned actor
   * - Returns "(5, 30)"
   */
  console.log(await c1.send({ method: 'toString' }));
  // Output: (5, 30)
};

main();

/**
 * EXECUTION FLOW:
 *
 * 1. p1 = Actor(Point, 10, 20)
 *    → p1.#state = Point { x: 10, y: 20 }
 *
 * 2. p1.send({ method: 'toString' })
 *    → Queue: [{ method: 'toString', args: [], resolve }]
 *    → Process: p1.#state.toString() → "(10, 20)"
 *    → Resolve promise with "(10, 20)"
 *
 * 3. p1.send({ method: 'clone' })
 *    → Queue: [{ method: 'clone', args: [], resolve }]
 *    → Process: p1.#state.clone() → new Actor(Point, 10, 20)
 *    → Resolve promise with new actor
 *
 * 4. c1.send({ method: 'move', args: [-5, 10] })
 *    → Queue: [{ method: 'move', args: [-5, 10], resolve }]
 *    → Process: c1.#state.move(-5, 10)
 *    → c1.#state now Point { x: 5, y: 30 }
 *
 * 5. c1.send({ method: 'toString' })
 *    → Queue: [{ method: 'toString', args: [], resolve }]
 *    → Process: c1.#state.toString() → "(5, 30)"
 *    → Resolve promise with "(5, 30)"
 *
 * BENEFITS OF THIS APPROACH:
 *
 * ✅ Generic: Works with any class, no modification needed
 * ✅ Composable: Actors can create other actors (clone example)
 * ✅ Type-safe: Entity methods are called directly
 * ✅ Request-Reply: Promises enable waiting for results
 * ✅ Encapsulation: Entity state only accessed through messages
 *
 * USE CASES:
 *
 * 1. Making legacy classes thread-safe:
 *    const safeDB = new Actor(DatabaseConnection, config);
 *    await safeDB.send({ method: 'query', args: [sql] });
 *
 * 2. Protecting shared resources:
 *    const fileActor = new Actor(FileHandle, '/path/to/file');
 *    await fileActor.send({ method: 'write', args: [data] });
 *
 * 3. Coordinating state machines:
 *    const gameActor = new Actor(GameState, players);
 *    await gameActor.send({ method: 'processMove', args: [move] });
 *
 * COMPARISON TO OTHER PATTERNS:
 *
 * vs Proxy Pattern:
 * - Proxy: Transparent forwarding
 * - Actor: Message-based, queued, sequential
 *
 * vs Decorator Pattern:
 * - Decorator: Adds behavior to methods
 * - Actor: Adds concurrency control
 *
 * vs Facade Pattern:
 * - Facade: Simplifies interface
 * - Actor: Protects concurrent access
 *
 * LIMITATIONS:
 *
 * ⚠️ Synchronous dispatch: Entity methods not awaited
 *    - If entity methods are async, use: await this.#state[method](...args)
 *
 * ⚠️ No error handling: Failed methods don't reject promises
 *    - Add try/catch and reject(error) in #process
 *
 * ⚠️ Fire-and-forget for void methods: No indication of completion
 *    - Can add completion callbacks or events
 *
 * ADVANCED PATTERNS:
 *
 * 1. Actor Supervision:
 *    - Parent actors monitor child actors
 *    - Restart failed actors
 *
 * 2. Actor Selection:
 *    - Address actors by path: /system/db/user-repo
 *    - Message routing
 *
 * 3. Actor Lifecycle:
 *    - preStart(), postStop() hooks
 *    - Graceful shutdown
 *
 * KEY TAKEAWAY:
 * This generic Actor implementation demonstrates how to make ANY class
 * safe for concurrent access by wrapping it in an actor and using
 * message passing instead of direct method calls.
 */
