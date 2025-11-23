'use strict';

/**
 * FILE PURPOSE: Promisified once() Utility
 *
 * This file demonstrates Node.js's once() utility function that converts
 * event waiting into a Promise for use with async/await.
 *
 * UTILITY FUNCTION: once(emitter, eventName)
 *
 * Returns Promise that resolves when event is emitted.
 * This enables await-based event handling instead of callbacks.
 *
 * PATTERN: Promisification
 * Converts callback-based API (events) into Promise-based API.
 *
 * BENEFITS:
 * ✅ Can await events (no callbacks)
 * ✅ Cleaner async code
 * ✅ Error handling via try/catch
 * ✅ Works with async/await patterns
 *
 * USE CASES:
 * - Wait for server to be ready
 * - Wait for data to arrive
 * - Wait for process to complete
 * - Synchronization in async code
 *
 * COMPARISON:
 * Callback style:
 *   emitter.once('ready', (data) => {
 *     console.log('Ready:', data);
 *   });
 *
 * Promise style (this file):
 *   const data = await once(emitter, 'ready');
 *   console.log('Ready:', data);
 */

/**
 * Import EventEmitter and once utility
 *
 * DESTRUCTURING:
 * Gets both EventEmitter class and once function from node:events.
 *
 * once FUNCTION:
 * Built-in Node.js utility (added in v11.13.0)
 * Signature: once(emitter, name, options?) => Promise
 *
 * WHAT once() DOES:
 * 1. Registers one-time listener internally
 * 2. Returns Promise
 * 3. When event emitted, resolves Promise with event args
 * 4. Auto-removes listener after event
 *
 * IMPLEMENTATION (conceptually):
 * function once(emitter, name) {
 *   return new Promise((resolve) => {
 *     emitter.once(name, (...args) => {
 *       resolve(args);
 *     });
 *   });
 * }
 */
const { EventEmitter, once } = require('node:events');

/**
 * Create EventEmitter instance
 */
const emitter = new EventEmitter();

/**
 * Async main function demonstrating await pattern
 *
 * PATTERN: Await Event
 * Use Promise to wait for event instead of callback.
 *
 * BENEFITS:
 * - Linear code flow (no callback nesting)
 * - Try/catch error handling
 * - Easier to read and maintain
 */
const main = async () => {
  /**
   * Wait for 'name' event using once() utility
   *
   * PROMISIFIED WAITING:
   * await once(emitter, 'name')
   *
   * EXECUTION FLOW:
   *
   * 1. once() called
   *    ↓
   * 2. Registers internal one-time listener
   *    ↓
   * 3. Returns Promise (pending)
   *    ↓
   * 4. await pauses execution (waits for Promise)
   *    ↓
   * ... waiting for event ...
   *    ↓
   * 5. emitter.emit('name', ...) happens (see below)
   *    ↓
   * 6. Internal listener called with args
   *    ↓
   * 7. Promise resolves with args ARRAY
   *    ↓
   * 8. await returns the array
   *    ↓
   * 9. res = array of arguments
   *
   * RETURN VALUE:
   * once() returns ARRAY of all arguments passed to emit().
   *
   * If emit('name', arg1, arg2, arg3):
   *   res = [arg1, arg2, arg3]
   *
   * If emit('name', singleArg):
   *   res = [singleArg]
   *
   * ALWAYS AN ARRAY (even for single argument)!
   *
   * TIMEOUT OPTION (not shown):
   * await once(emitter, 'name', { signal: abortSignal })
   * Can abort waiting via AbortController.
   */
  const res = await once(emitter, 'name');
  
  /**
   * Log result
   *
   * EXPECTED: Array of all arguments from emit
   *
   * Since emit passes 3 arguments: { a: 4 }, { a: 5 }, { a: 6 }
   * Result will be: [{ a: 4 }, { a: 5 }, { a: 6 }]
   */
  console.log(res);
  // Output: [ { a: 4 }, { a: 5 }, { a: 6 } ]
};

/**
 * Start async main function
 *
 * main() returns Promise that's not awaited here.
 * Process continues to next statement.
 */
main();

/**
 * Emit event with multiple arguments
 *
 * TIMING:
 * This emit happens AFTER main() starts but BEFORE await returns.
 *
 * EXECUTION ORDER:
 * 1. main() called
 * 2. once() creates Promise and registers listener
 * 3. await pauses main() execution
 * 4. main() returns (but await is still pending)
 * 5. This emit() executes
 * 6. Listener (from once) called with all 3 arguments
 * 7. Promise resolves with [{ a: 4 }, { a: 5 }, { a: 6 }]
 * 8. await in main() returns
 * 9. console.log prints array
 *
 * MULTIPLE ARGUMENTS:
 * emit('name', arg1, arg2, arg3)
 *   → Listener receives all 3 args
 *   → Promise resolves with [arg1, arg2, arg3]
 *   → await returns array
 *
 * This demonstrates once() collects ALL emit arguments into array.
 */
emitter.emit('name', { a: 4 }, { a: 5 }, { a: 6 });

/**
 * USAGE PATTERNS:
 *
 * 1. WAIT FOR READY:
 *    const server = new Server();
 *    await once(server, 'listening');
 *    console.log('Server ready');
 *
 * 2. WAIT FOR DATA:
 *    const stream = createStream();
 *    const [chunk] = await once(stream, 'data');
 *    processChunk(chunk);
 *
 * 3. WAIT FOR COMPLETION:
 *    const process = spawn('command');
 *    const [code] = await once(process, 'exit');
 *    console.log('Exited with code:', code);
 *
 * 4. WITH TIMEOUT:
 *    const ac = new AbortController();
 *    setTimeout(() => ac.abort(), 5000);
 *
 *    try {
 *      await once(emitter, 'data', { signal: ac.signal });
 *    } catch (err) {
 *      console.log('Timed out after 5s');
 *    }
 *
 * 5. ERROR HANDLING:
 *    try {
 *      await once(emitter, 'success');
 *    } catch (err) {
 *      // Handles if emitter emits 'error' event
 *    }
 */

/**
 * CALLBACK vs PROMISE COMPARISON:
 *
 * CALLBACK STYLE (traditional):
 *   emitter.once('ready', (data) => {
 *     console.log('Ready:', data);
 *     doSomething(data);
 *   });
 *
 * PROMISE STYLE (this file):
 *   const [data] = await once(emitter, 'ready');
 *   console.log('Ready:', data);
 *   doSomething(data);
 *
 * BENEFITS OF PROMISE STYLE:
 * ✅ Linear code flow (easier to read)
 * ✅ No callback nesting
 * ✅ try/catch error handling
 * ✅ Can combine with Promise.race, Promise.all
 * ✅ Modern async/await patterns
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. once() UTILITY: Promisifies event waiting
 * 2. RETURNS ARRAY: All emit arguments in array
 * 3. AWAIT PATTERN: const [data] = await once(emitter, 'event')
 * 4. ONE-TIME: Auto-removes listener after event
 * 5. TIMEOUT: Can use AbortSignal for timeout
 * 6. ERROR HANDLING: Rejects if 'error' event emitted
 *
 * COMPARISON FILES:
 * - 8-once.js (this): Node.js once() utility
 * - 9-emit.js: Custom async emit wrapper
 * - ../EventEmitter/c-async.js: Full async EventEmitter
 *
 * This utility is essential for modern async Node.js patterns!
 */
