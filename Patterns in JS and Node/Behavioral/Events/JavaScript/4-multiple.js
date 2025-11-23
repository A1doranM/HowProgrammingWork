'use strict';

/**
 * FILE PURPOSE: Compare Duplicate Listener Handling
 *
 * This file demonstrates a CRITICAL DIFFERENCE between EventTarget and EventEmitter:
 * How they handle registering the same listener multiple times.
 *
 * KEY DIFFERENCE:
 * - EventTarget: AUTO-DEDUPLICATES (same listener registered once only)
 * - EventEmitter: ALLOWS DUPLICATES (same listener can be registered multiple times)
 *
 * This behavioral difference is IMPORTANT to understand and can cause bugs
 * if you're not aware of it when switching between systems!
 *
 * DEMONSTRATION:
 * Both systems: Register same handler 3 times
 * EventTarget: Handler called ONCE
 * EventEmitter: Handler called THREE TIMES
 *
 * WHY THIS MATTERS:
 * - Memory leaks if unaware of EventEmitter behavior
 * - Unexpected multiple executions
 * - Need different removal strategies
 */

const EventEmitter = require('node:events');

// ===========================
// Part 1: EventTarget - Auto-Deduplication
// ===========================

/**
 * Create EventTarget for deduplication test
 */
const target = new EventTarget();

/**
 * Define named handler function
 *
 * IMPORTANT: Using named function (not arrow)
 * so we can reference it for multiple registrations.
 *
 * The SAME function reference will be used 3 times.
 */
const targetHandler = (event) => {
  console.log({ data: event.detail });
};

/**
 * Register same handler THREE times
 *
 * EVENTTARGET BEHAVIOR: Deduplication
 *
 * addEventListener checks if listener already registered.
 * If same function reference exists, ignores the registration.
 *
 * REGISTRATION ATTEMPTS:
 * 1. addEventListener('name', targetHandler)  → ADDED (new)
 * 2. addEventListener('name', targetHandler)  → IGNORED (duplicate)
 * 3. addEventListener('name', targetHandler)  → IGNORED (duplicate)
 *
 * RESULT:
 * Internal listeners for 'name': [targetHandler]  (just ONE)
 *
 * WHY DEDUPLICATION?
 * W3C standard designed for DOM where accidental duplicate
 * registrations are common (e.g., script loaded twice).
 *
 * COMPARISON:
 * Same function, same event → deduplicated
 * Different function instances, same event → both added:
 *   addEventListener('name', () => {})  // Function 1
 *   addEventListener('name', () => {})  // Function 2 (different!)
 *   // Both would be registered (different references)
 */
target.addEventListener('name', targetHandler);  // 1. ADDED
target.addEventListener('name', targetHandler);  // 2. IGNORED (duplicate)
target.addEventListener('name', targetHandler);  // 3. IGNORED (duplicate)

/**
 * Create and dispatch event
 */
const event = new CustomEvent('name', {
  detail: { id: 100, city: 'Roma', country: 'Italy' },
});

/**
 * Dispatch event to EventTarget
 *
 * EXPECTED OUTPUT:
 * { data: { id: 100, city: 'Roma', country: 'Italy' } }
 *
 * OUTPUT COUNT: ONCE
 *
 * Even though we registered handler 3 times,
 * it's called only ONCE because EventTarget deduplicated.
 *
 * INTERNAL EXECUTION:
 * listeners = [targetHandler]  // Just one
 * for listener in listeners:
 *   listener(event)  // Called once
 */
target.dispatchEvent(event);

// ===========================
// Part 2: EventEmitter - Allows Duplicates
// ===========================

/**
 * Create EventEmitter for duplicate test
 */
const emitter = new EventEmitter();

/**
 * Define named handler function (same pattern as EventTarget)
 */
const emitterHandler = (data) => {
  console.dir({ data });
};

/**
 * Register same handler THREE times
 *
 * EVENTEMITTER BEHAVIOR: Allows Duplicates
 *
 * on() ALWAYS adds the listener, even if already registered.
 * Does NOT check for duplicates.
 *
 * REGISTRATION:
 * 1. on('name', emitterHandler)  → ADDED
 * 2. on('name', emitterHandler)  → ADDED AGAIN
 * 3. on('name', emitterHandler)  → ADDED AGAIN
 *
 * RESULT:
 * Internal listeners for 'name': [emitterHandler, emitterHandler, emitterHandler]
 * THREE TIMES!
 *
 * WHY ALLOW DUPLICATES?
 * Node.js EventEmitter designed for programmatic use where
 * developer controls registrations. Deduplication adds overhead.
 *
 * IMPLICATION:
 * If you accidentally register multiple times, handler executes multiple times!
 * Can cause:
 * - Unexpected behavior (handler runs 3x)
 * - Performance issues (wasted executions)
 * - Memory leaks (handlers accumulate)
 *
 * PREVENTION:
 * - Track if already registered
 * - Remove before re-adding
 * - Use once() for temporary listeners
 */
emitter.on('name', emitterHandler);  // 1. ADDED
emitter.on('name', emitterHandler);  // 2. ADDED (NOT deduplicated!)
emitter.on('name', emitterHandler);  // 3. ADDED (NOT deduplicated!)

/**
 * Emit event to EventEmitter
 *
 * EXPECTED OUTPUT:
 * { data: { a: 5 } }
 * { data: { a: 5 } }
 * { data: { a: 5 } }
 *
 * OUTPUT COUNT: THREE TIMES
 *
 * Handler registered 3 times → called 3 times!
 *
 * INTERNAL EXECUTION:
 * listeners = [emitterHandler, emitterHandler, emitterHandler]
 * for listener in listeners:
 *   listener({ a: 5 })  // Called 3 times
 *
 * COMPARISON TO EventTarget:
 * EventTarget: Same registration → called ONCE
 * EventEmitter: Same registration → called MULTIPLE TIMES
 *
 * This is the KEY BEHAVIORAL DIFFERENCE!
 */
emitter.emit('name', { a: 5 });

/**
 * COMPLETE OUTPUT COMPARISON:
 *
 * EVENTTARGET (once):
 * { data: { id: 100, city: 'Roma', country: 'Italy' } }
 *
 * EVENTEMITTER (three times):
 * { data: { a: 5 } }
 * { data: { a: 5 } }
 * { data: { a: 5 } }
 *
 * OBSERVATION:
 * Same handler reference registered 3 times:
 * - EventTarget: Calls once (deduplicated)
 * - EventEmitter: Calls thrice (not deduplicated)
 */

/**
 * PRACTICAL IMPLICATIONS:
 *
 * 1. EVENTTARGET ADVANTAGE:
 *    Protection against accidental duplicate registrations.
 *    Common in DOM where scripts might load multiple times.
 *
 * 2. EVENTEMITTER CAVEAT:
 *    Must manually prevent duplicates if needed:
 *
 *    const registered = new Set();
 *    function safeOn(event, handler) {
 *      const key = `${event}:${handler}`;
 *      if (registered.has(key)) return;
 *      registered.add(key);
 *      emitter.on(event, handler);
 *    }
 *
 * 3. REMOVAL DIFFERENCE:
 *    EventTarget: removeEventListener removes all (deduplicated to 1)
 *    EventEmitter: removeListener removes ONE occurrence at a time
 *    (See 5-remove.js for demonstration)
 */

/**
 * WHY DIFFERENT BEHAVIORS?
 *
 * EVENTTARGET (W3C):
 * - Designed for browsers/DOM
 * - Script tags might execute multiple times
 * - User might click "attach handler" multiple times
 * - Deduplication protects against accidents
 *
 * EVENTEMITTER (Node.js):
 * - Designed for server-side code
 * - Programmatic control (not user-triggered)
 * - Duplicates might be intentional
 * - No deduplication overhead
 *
 * Both designs make sense in their contexts!
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. DEDUPLICATION: EventTarget yes, EventEmitter no
 * 2. SAME HANDLER: EventTarget (1 call), EventEmitter (N calls)
 * 3. MEMORY: EventEmitter can accumulate duplicates
 * 4. REMOVAL: Different strategies needed (see 5-remove.js)
 * 5. BE AWARE: Know which system you're using!
 *
 * NEXT FILE (5-remove.js):
 * Demonstrates how removal behaves differently in each system.
 */
