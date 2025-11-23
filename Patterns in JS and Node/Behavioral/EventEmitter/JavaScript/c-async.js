'use strict';

/**
 * FILE PURPOSE: Async EventEmitter - Promise-Based Event System
 *
 * This file demonstrates an ASYNC-FIRST EventEmitter where:
 * - Listeners can be async functions
 * - emit() returns Promise (waits for all listeners)
 * - once() can be promisified: await emitter.once('event')
 * - Separate tracking for on() and once() listeners
 *
 * KEY INNOVATIONS:
 * ✅ Async listeners: Listeners can return Promises
 * ✅ Promise.all: emit() waits for all listeners to complete
 * ✅ Promisified once: once() returns Promise when no function provided
 * ✅ Separate Sets: on and once tracked separately for efficiency
 *
 * USE CASES:
 * - Async workflows (wait for all handlers to complete)
 * - Await-based event handling
 * - Coordinated async operations
 * - Promise-based event systems
 *
 * COMPARISON:
 * - 1-simple.js: Synchronous listeners
 * - b-class.js: Synchronous with Set/Map
 * - c-async.js (this): Async with Promise.all
 *
 * THIS IS ADVANCED EventEmitter for modern async patterns!
 */

/**
 * AsyncEmitter Class
 *
 * EventEmitter specifically designed for async/await patterns.
 *
 * KEY DESIGN DECISIONS:
 *
 * 1. SEPARATE on/once SETS:
 *    Instead of: events.get(name) = Set<Function>
 *    Use: events.get(name) = { on: Set, once: Set }
 *
 *    WHY? Easy to clear once listeners after emission.
 *
 * 2. ASYNC emit():
 *    Returns Promise.all() of all listener results
 *    Caller can await until all listeners complete
 *
 * 3. PROMISIFIED once():
 *    once(name) without function returns Promise
 *    Enables: const data = await ee.once('data')
 *
 * ARCHITECTURE:
 *
 * AsyncEmitter {
 *   events: Map<string, { on: Set, once: Set }>
 * }
 *
 * Each event has TWO listener sets for efficiency.
 */
class AsyncEmitter {
  /**
   * Initialize with empty events Map
   *
   * STRUCTURE:
   * events = Map {
   *   'event1' => { on: Set<Function>, once: Set<Function> },
   *   'event2' => { on: Set<Function>, once: Set<Function> }
   * }
   *
   * WHY SEPARATE on/once?
   * - Easy to clear once listeners after emit
   * - Can differentiate in introspection
   * - Clearer code (explicit separation)
   */
  constructor() {
    this.events = new Map();
  }

  /**
   * Get or create event object
   *
   * HELPER METHOD (not public API)
   *
   * @param {any} name - Event name
   * @returns {Object} - { on: Set, once: Set }
   *
   * PURPOSE:
   * Ensure event exists and has both on and once Sets.
   * Used internally by on(), once(), and other methods.
   *
   * LAZY CREATION:
   * Event object created only when first listener registered.
   *
   * EXECUTION:
   *
   * event('click')
   *   → events.get('click') = undefined
   *   → Create: { on: Set(), once: Set() }
   *   → events.set('click', { on: Set(), once: Set() })
   *   → Return: { on: Set(), once: Set() }
   *
   * event('click') again
   *   → events.get('click') = { on: Set(), once: Set() }
   *   → Return existing
   *
   * BENEFIT:
   * Centralizes event object creation logic.
   * All methods use this helper for consistency.
   */
  event(name) {
    let event = this.events.get(name);
    if (event) return event;  // Already exists
    
    // Create new event object with two Sets
    const on = new Set();     // Persistent listeners
    const once = new Set();   // One-time listeners
    event = { on, once };
    
    // Register and return
    this.events.set(name, event);
    return event;
  }

  /**
   * Register persistent listener
   *
   * @param {any} name - Event name
   * @param {Function} fn - Listener (can be async!)
   *
   * ASYNC LISTENER SUPPORT:
   *
   * ee.on('event', async (data) => {
   *   await processAsync(data);
   *   return result;
   * });
   *
   * The listener returns a Promise.
   * emit() will wait for it via Promise.all().
   *
   * IMPLEMENTATION:
   * Simply adds function to the 'on' Set.
   * Doesn't care if function is sync or async.
   */
  on(name, fn) {
    this.event(name).on.add(fn);  // Add to 'on' Set
  }

  /**
   * Register one-time listener OR create Promise
   *
   * DUAL BEHAVIOR:
   *
   * 1. With function: Register once listener
   *    ee.once('event', fn)
   *
   * 2. Without function: Return Promise that resolves on event
   *    const data = await ee.once('event')
   *
   * @param {any} name - Event name
   * @param {Function} fn - Optional: Listener function
   * @returns {Promise|null} - Promise if no fn, null if fn provided
   *
   * PROMISIFIED ONCE PATTERN:
   *
   * USAGE:
   * const data = await ee.once('ready');
   * console.log('Ready with data:', data);
   *
   * IMPLEMENTATION:
   * When no fn provided:
   * 1. Return new Promise
   * 2. Promise's resolve is used as the listener
   * 3. When event emitted, resolve is called with data
   * 4. Promise resolves, await returns data
   *
   * EXECUTION FLOW:
   *
   * const dataPromise = ee.once('data')
   *   ↓
   * 1. fn === undefined
   * 2. Create Promise with resolve
   * 3. Call this.once('data', resolve)
   * 4. resolve added to once Set
   * 5. Return Promise
   *   ↓
   * await dataPromise
   *   ↓ (waiting...)
   *   ↓
   * ee.emit('data', { value: 42 })
   *   ↓
   * 1. Get once listeners: [resolve]
   * 2. Call resolve({ value: 42 })
   * 3. Promise resolves with { value: 42 }
   *   ↓
   * await returns { value: 42 }
   *
   * BRILLIANT PATTERN:
   * Uses Promise's resolve function as the listener!
   * When event emitted, resolve is called, Promise resolves.
   *
   * NO WRAPPER TRACKING:
   * Unlike b-class.js, doesn't track wrappers.
   * Simpler because different approach to once().
   */
  once(name, fn) {
    if (fn === undefined) {
      /**
       * PROMISIFIED MODE: No function provided
       *
       * Return Promise that resolves when event emitted.
       *
       * PATTERN: Promise as Event Listener
       * - Promise's resolve becomes the listener
       * - When event emitted, resolve called
       * - Promise fulfills with event data
       *
       * USAGE:
       * const result = await ee.once('complete');
       * // Waits until 'complete' event emitted
       */
      return new Promise((resolve) => {
        this.once(name, resolve);  // Recursive call with resolve as listener
      });
    }
    
    /**
     * NORMAL MODE: Function provided
     *
     * Register one-time listener in 'once' Set.
     *
     * NOTE: No wrapper needed!
     * emit() clears the entire once Set after calling listeners.
     * So listeners are automatically removed.
     */
    this.event(name).once.add(fn);  // Add to 'once' Set
    return null;  // Explicitly return null (not undefined)
  }

  /**
   * Emit event asynchronously
   *
   * ASYNC EMIT:
   * Returns Promise that resolves when ALL listeners complete.
   *
   * @param {any} name - Event name
   * @param {...any} args - Arguments to pass to listeners
   * @returns {Promise<any[]>} - Promise.all result (array of listener results)
   *
   * ASYNC EXECUTION FLOW:
   *
   * await ee.emit('event', data)
   *   ↓
   * 1. Get event: { on: Set, once: Set }
   * 2. Convert Sets to arrays: [...on], [...once]
   * 3. Call all listeners: listeners.map(fn => fn(data))
   * 4. Get array of Promises (or values if sync listeners)
   * 5. Clear once Set (one-time listeners removed)
   * 6. await Promise.all(promises)
   * 7. Return results array
   *   ↓
   * All listeners completed
   *
   * KEY FEATURES:
   *
   * 1. PARALLEL EXECUTION:
   *    All listeners called immediately (not awaited individually)
   *    Promise.all waits for all to complete
   *    Faster than sequential await
   *
   * 2. AUTO-CLEANUP:
   *    once.clear() removes all one-time listeners
   *    No wrapper tracking needed!
   *
   * 3. RESULT COLLECTION:
   *    Returns array of all listener results
   *    Can use: const results = await ee.emit('event')
   *
   * 4. SYNC/ASYNC COMPATIBLE:
   *    Sync listeners: fn(data) returns value
   *    Async listeners: fn(data) returns Promise
   *    Promise.all handles both (wraps values in resolved Promises)
   *
   * EXAMPLE:
   *
   * ee.on('save', async (data) => {
   *   await database.save(data);
   *   return 'saved';
   * });
   *
   * ee.on('save', async (data) => {
   *   await cache.update(data);
   *   return 'cached';
   * });
   *
   * const results = await ee.emit('save', { id: 1 });
   * // results = ['saved', 'cached']
   * // Both operations completed
   */
  async emit(name, ...args) {
    const event = this.events.get(name);
    if (!event) return null;  // No listeners
    
    /**
     * Extract on and once Sets
     */
    const { on, once } = event;
    
    /**
     * Convert Sets to Arrays
     *
     * WHY CONVERT?
     * Need to:
     * 1. Combine on and once listeners
     * 2. Map over them to create Promises
     * 3. Clear once Set before awaiting
     *
     * SPREAD OPERATOR:
     * [...set.values()] creates array from Set iterator
     */
    const aon = [...on.values()];      // Persistent listeners
    const aonce = [...once.values()];  // One-time listeners
    
    /**
     * Call all listeners and collect Promises
     *
     * PARALLEL EXECUTION:
     * All listeners called immediately (not awaited yet).
     * Creates array of Promises (or values if sync).
     *
     * map() USAGE:
     * aon.concat(aonce) creates combined array
     * .map(fn => fn(...args)) calls each listener
     *
     * RESULT:
     * promises = [Promise1, Promise2, value3, Promise4]
     * (Mix of Promises from async and values from sync listeners)
     */
    const promises = aon.concat(aonce).map((fn) => fn(...args));
    
    /**
     * Clear one-time listeners
     *
     * IMPORTANT: Clear BEFORE awaiting!
     *
     * If we cleared after Promise.all:
     * - Listener could re-emit same event
     * - Would cause infinite loop
     *
     * By clearing before await:
     * - Once listeners can't be called again
     * - Even if listener re-emits event
     */
    once.clear();
    
    /**
     * AUTO-CLEANUP: Remove empty events
     *
     * If event has no more listeners, remove it entirely.
     * Prevents memory leaks from empty objects.
     */
    if (on.size === 0 && once.size === 0) {
      this.events.delete(name);
    }
    
    /**
     * Wait for all listeners to complete
     *
     * Promise.all:
     * - Waits for all Promises to resolve
     * - Returns array of results
     * - If any Promise rejects, entire Promise.all rejects
     *
     * RETURN VALUE:
     * Array of all listener return values/resolved values
     *
     * EXAMPLE:
     * const results = await ee.emit('event');
     * results = [result1, result2, result3]
     */
    return Promise.all(promises);
  }

  /**
   * Remove listener (synchronous)
   *
   * @param {any} name - Event name
   * @param {Function} fn - Listener to remove
   *
   * REMOVES FROM BOTH:
   * Checks both 'on' and 'once' Sets and removes from both.
   *
   * WHY BOTH?
   * Don't know if listener was registered with on() or once().
   * Safe to try deleting from both (Set.delete is idempotent).
   *
   * AUTO-CLEANUP:
   * If no listeners remain, delete entire event.
   */
  remove(name, fn) {
    const { events } = this;
    const event = events.get(name);
    if (!event) return;
    
    const { on, once } = event;
    on.delete(fn);    // Remove from persistent (if exists)
    once.delete(fn);  // Remove from one-time (if exists)
    
    // Clean up empty event
    if (on.size === 0 && once.size === 0) {
      this.events.delete(name);
    }
  }

  /**
   * Clear listeners (same as b-class.js)
   */
  clear(name) {
    const { events } = this;
    if (!name) {
      events.clear();  // Clear all
      return;
    }
    const event = events.get(name);
    if (event) events.delete(name);  // Clear specific
  }

  /**
   * Count total listeners
   *
   * @param {any} name - Event name
   * @returns {number} - Total listeners (on + once)
   *
   * COUNTS BOTH:
   * Returns sum of on and once listeners.
   */
  count(name) {
    const event = this.events.get(name);
    if (!event) return 0;
    
    const { on, once } = event;
    return on.size + once.size;  // Sum of both Sets
  }

  /**
   * Get all listeners as array
   *
   * @param {any} name - Event name
   * @returns {Array} - Combined array of on and once listeners
   *
   * COMBINES BOTH:
   * Returns single array with all listeners (on + once).
   *
   * SPREAD OPERATOR:
   * [...on.values(), ...once.values()]
   * Creates array from both Sets combined.
   */
  listeners(name) {
    const event = this.events.get(name);
    if (!event) return [];
    
    const { on, once } = event;
    return [...on.values(), ...once.values()];
  }

  /**
   * Get event names (same as b-class.js)
   */
  names() {
    return [...this.events.keys()];
  }
}

// ===========================
// Usage Example: Async Event Handling
// ===========================

/**
 * Async main function
 *
 * All examples must be in async context to use await.
 *
 * DEMONSTRATES:
 * - Multiple async listeners per event
 * - await ee.emit() to wait for all listeners
 * - Parallel listener execution with coordinated completion
 */
const main = async () => {
  /**
   * Create AsyncEmitter instance
   */
  const ee = new AsyncEmitter();

  /**
   * Register 3 async listeners for 'e1'
   *
   * Each listener is async (can use await inside).
   * All will execute in parallel when event emitted.
   */
  ee.on('e1', async () => {
    console.log('e1 listener 1');
    // Could await async operations here
  });

  ee.on('e1', async () => {
    console.log('e1 listener 2');
  });

  ee.on('e1', async () => {
    console.log('e1 listener 3');
  });

  /**
   * Register 2 async listeners for 'e2'
   */
  ee.on('e2', async () => {
    console.log('e2 listener 1');
  });

  ee.on('e2', async () => {
    console.log('e2 listener 2');
  });

  /**
   * Emit events with await
   *
   * EXECUTION FLOW:
   *
   * console.log('begin')
   *   ↓
   * await ee.emit('e1')
   *   ↓ Calls 3 listeners in parallel
   *   → e1 listener 1 (async)
   *   → e1 listener 2 (async)
   *   → e1 listener 3 (async)
   *   ↓ Promise.all waits for all 3
   *   ↓ All complete
   *   ↓ await returns
   *   ↓
   * await ee.emit('e2')
   *   ↓ Calls 2 listeners in parallel
   *   → e2 listener 1 (async)
   *   → e2 listener 2 (async)
   *   ↓ Promise.all waits for both
   *   ↓ Both complete
   *   ↓ await returns
   *   ↓
   * console.log('end')
   *
   * OUTPUT:
   * begin
   * e1 listener 1
   * e1 listener 2
   * e1 listener 3
   * e2 listener 1
   * e2 listener 2
   * end
   *
   * KEY OBSERVATIONS:
   * - All e1 listeners complete before e2 starts (await)
   * - Within each event, listeners run in parallel
   * - 'end' only prints after ALL listeners complete
   */
  console.log('begin');
  await ee.emit('e1');  // Wait for all e1 listeners
  await ee.emit('e2');  // Wait for all e2 listeners
  console.log('end');
};

/**
 * Execute main function
 *
 * Starts the async workflow.
 * Any uncaught errors will crash the process.
 */
main();


/**
 * USAGE DEMONSTRATION ABOVE:
 * 
 * This file demonstrates async EventEmitter with:
 * 1. Async listeners (await in handlers)
 * 2. Promise.all emission (waits for all)
 * 3. Promisified once() (await ee.once('event'))
 * 
 * KEY PATTERNS SHOWN:
 * - Parallel async execution (all listeners start simultaneously)
 * - Coordinated completion (await ensures all done)
 * - Promise-based event waiting (await once)
 * 
 * REAL-WORLD USE CASES:
 * - Async workflows (wait for all tasks)
 * - Coordinated saves (DB + cache + files)
 * - Async initialization (await ready event)
 * - Parallel processing (start all, wait for all)
 */

/**
 * ASYNC EVENTEMITTER SUMMARY:
 * 
 * INNOVATIONS:
 * ✅ emit() returns Promise
 * ✅ Listeners can be async
 * ✅ Promise.all waits for all
 * ✅ once() can be promisified
 * ✅ Separate on/once tracking
 * 
 * BENEFITS:
 * ✅ Async coordination
 * ✅ Error handling via Promise
 * ✅ Result collection
 * ✅ Modern async/await patterns
 * 
 * COMPARISON TO SYNC VERSIONS:
 * - b-class.js: Sync listeners, immediate return
 * - c-async.js: Async listeners, awaitable emit
 * 
 * Choose based on needs:
 * - Sync operations? Use b-class.js
 * - Async operations? Use c-async.js
 * 
 * PATTERN EVOLUTION COMPLETE:
 * 1-simple → 6-closure → 8-methods → b-class → c-async
 * Each adds features, culminating in full async support!
 */
