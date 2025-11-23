'use strict';

/**
 * FILE PURPOSE: Compare Listener Removal Behavior
 *
 * This file demonstrates how EventTarget and EventEmitter differ in
 * listener removal when the same listener is registered multiple times.
 *
 * BUILDS ON 4-multiple.js:
 * - 4-multiple.js: Shows EventTarget deduplicates, EventEmitter doesn't
 * - 5-remove.js (this): Shows how this affects removal
 *
 * KEY DIFFERENCE:
 * - EventTarget: removeEventListener removes all (only 1 exists due to dedup)
 * - EventEmitter: removeListener removes ONE occurrence at a time
 *
 * PRACTICAL IMPACT:
 * With EventEmitter, if same handler registered N times:
 * - Must call removeListener N times to remove all
 * - Each call removes one occurrence
 * - OR use removeAllListeners to remove all at once
 *
 * THIS IS IMPORTANT FOR:
 * - Memory leak prevention
 * - Cleanup logic
 * - Understanding listener lifecycle
 */

const EventEmitter = require('node:events');

// ===========================
// Part 1: EventTarget Removal
// ===========================

/**
 * Create EventTarget instance
 */
const target = new EventTarget();

/**
 * Define handler function (same reference used 3 times)
 */
const targetHandler = (event) => {
  console.log({ data: event.detail });
};

/**
 * Register handler 3 times (deduplicated to 1)
 *
 * As shown in 4-multiple.js:
 * - First registration: ADDED
 * - Second registration: IGNORED (duplicate)
 * - Third registration: IGNORED (duplicate)
 *
 * Internal state: listeners = [targetHandler]  (just ONE)
 */
target.addEventListener('name', targetHandler);
target.addEventListener('name', targetHandler);
target.addEventListener('name', targetHandler);

/**
 * Remove listener ONCE
 *
 * METHOD: removeEventListener(type, listener)
 *
 * EVENTTARGET REMOVAL:
 * Removes the listener from internal registry.
 * Since only ONE instance exists (deduplicated), this removes it.
 *
 * INTERNAL STATE AFTER REMOVAL:
 * listeners = []  (empty)
 *
 * BEHAVIOR:
 * One removeEventListener call removes all
 * (because they were deduplicated to one).
 */
target.removeEventListener('name', targetHandler);

/**
 * Dispatch event after removal
 *
 * EXPECTED OUTPUT: Nothing
 *
 * No listeners remain (single listener was removed).
 * dispatchEvent has no effect.
 *
 * INTERNAL EXECUTION:
 * listeners = []  // Empty after removal
 * for listener in listeners:  // Loop doesn't run
 *   // Nothing
 */
const event = new CustomEvent('name', {
  detail: { id: 100, city: 'Roma', country: 'Italy' },
});

target.dispatchEvent(event);
// No output - listener was removed

// ===========================
// Part 2: EventEmitter Removal
// ===========================

/**
 * Create EventEmitter instance
 */
const emitter = new EventEmitter();

/**
 * Define handler function (same reference used 3 times)
 */
const emitterHandler = (data) => {
  console.dir({ data });
};

/**
 * Register handler 3 times (NOT deduplicated)
 *
 * As shown in 4-multiple.js:
 * - First registration: ADDED
 * - Second registration: ADDED (NOT a duplicate)
 * - Third registration: ADDED (NOT a duplicate)
 *
 * Internal state: listeners = [emitterHandler, emitterHandler, emitterHandler]
 * THREE TIMES!
 */
emitter.on('name', emitterHandler);  // Count: 1
emitter.on('name', emitterHandler);  // Count: 2
emitter.on('name', emitterHandler);  // Count: 3

/**
 * First removal: Remove ONE occurrence
 *
 * METHOD: removeListener(eventName, listener)
 * ALIAS: off() (same as removeListener)
 *
 * EVENTEMITTER REMOVAL:
 * Removes FIRST occurrence of listener from array.
 * Uses indexOf to find, splice to remove.
 *
 * PROCESS:
 * 1. listeners = [handler, handler, handler]
 * 2. indexOf(handler) → 0 (first position)
 * 3. splice(0, 1) → remove at index 0
 * 4. listeners = [handler, handler]  (2 remain!)
 *
 * INTERNAL STATE:
 * Before: [emitterHandler, emitterHandler, emitterHandler]
 * After:  [emitterHandler, emitterHandler]
 */
emitter.removeListener('name', emitterHandler);

/**
 * Emit after first removal
 *
 * EXPECTED OUTPUT:
 * { data: { a: 4 } }
 * { data: { a: 4 } }
 *
 * OUTPUT COUNT: TWICE
 *
 * Two occurrences remain after removing one.
 * Handler called twice when event emitted.
 *
 * INTERNAL EXECUTION:
 * listeners = [emitterHandler, emitterHandler]  // 2 left
 * for listener in listeners:
 *   listener({ a: 4 })  // Called twice
 */
emitter.emit('name', { a: 4 });

/**
 * Second removal: Remove another occurrence
 *
 * INTERNAL STATE:
 * Before: [emitterHandler, emitterHandler]
 * After:  [emitterHandler]
 */
emitter.removeListener('name', emitterHandler);

/**
 * Emit after second removal
 *
 * EXPECTED OUTPUT:
 * { data: { a: 5 } }
 *
 * OUTPUT COUNT: ONCE
 *
 * One occurrence remains.
 * Handler called once when event emitted.
 */
emitter.emit('name', { a: 5 });

/**
 * Third removal: Remove last occurrence
 *
 * INTERNAL STATE:
 * Before: [emitterHandler]
 * After:  []  (empty)
 */
emitter.removeListener('name', emitterHandler);

/**
 * Emit after third removal
 *
 * EXPECTED OUTPUT: Nothing
 *
 * No listeners remain.
 * emit() has no effect.
 */
emitter.emit('name', { a: 6 });

/**
 * Alternative: Remove all listeners at once
 *
 * METHOD: removeAllListeners(eventName)
 *
 * Removes ALL listeners for specified event.
 * More efficient than calling removeListener multiple times.
 *
 * USAGE:
 * emitter.removeAllListeners('name');
 * // All listeners for 'name' removed, regardless of count
 *
 * ALTERNATIVE: Remove all events
 * emitter.removeAllListeners();
 * // All listeners for ALL events removed
 *
 * NOTE:
 * This call has no effect here (listeners already removed above).
 * Shown for demonstration of the API.
 */
emitter.removeAllListeners('name');

/**
 * REMOVAL COMPARISON SUMMARY:
 *
 * EVENTTARGET:
 * - Register 3 times → 1 listener (deduplicated)
 * - Remove once → 0 listeners (all removed)
 * - Dispatch → Not called
 *
 * EVENTEMITTER:
 * - Register 3 times → 3 listeners (not deduplicated)
 * - Remove once → 2 listeners (one removed)
 * - Emit → Called twice
 * - Remove again → 1 listener
 * - Emit → Called once
 * - Remove again → 0 listeners
 * - Emit → Not called
 *
 * KEY INSIGHT:
 * EventEmitter requires N removeListener calls for N registrations.
 * EventTarget requires just 1 (due to deduplication).
 */

/**
 * PRACTICAL CLEANUP PATTERNS:
 *
 * 1. WITH EVENTTARGET:
 *    target.addEventListener('event', handler);
 *    // ... later
 *    target.removeEventListener('event', handler);
 *    // Always removes completely (even if added multiple times)
 *
 * 2. WITH EVENTEMITTER - CAREFUL REMOVAL:
 *    emitter.on('event', handler);
 *    // ... later
 *    emitter.removeListener('event', handler);
 *    // Removes ONE occurrence (might still be registered!)
 *
 * 3. WITH EVENTEMITTER - SAFE REMOVAL:
 *    emitter.on('event', handler);
 *    // ... later
 *    emitter.removeAllListeners('event');
 *    // Guaranteed to remove all listeners for event
 *
 * 4. PREVENT DUPLICATES (EventEmitter):
 *    if (emitter.listenerCount('event') === 0) {
 *      emitter.on('event', handler);
 *    }
 *    // Only add if not already registered
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. EVENTTARGET REMOVAL: Simple (one call removes all)
 * 2. EVENTEMITTER REMOVAL: Complex (one call removes one)
 * 3. removeAllListeners: EventEmitter's solution for bulk removal
 * 4. BE CAREFUL: Know your event system's behavior
 * 5. MEMORY LEAKS: EventEmitter more prone if not careful
 *
 * COMPARISON:
 * - 4-multiple.js: Shows duplicate behavior
 * - 5-remove.js (this): Shows removal consequences
 *
 * NEXT FILES:
 * - 7-error.js: Error event handling
 * - 8-once.js: Promisified once
 * - 9-emit.js: Async emit
 */
